import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { BIG_ZERO, ethersToSerializedBigNumber } from '@dehub/shared/utils';
import { fetchUserTicketsPerMultipleRounds } from './helpers';

import StandardLotteryAbi from '../../config/abis/StandardLottery.json';
import {
  LotteryStatus,
  LotteryTicket,
  LotteryTicketClaimData,
} from '../../config/constants/types';
import { getStandardLotteryAddress } from '../../utils/addressHelpers';
import { Call, multicallv2 } from '../../utils/multicall';

interface LotteryStatusAndFinalNumber {
  roundId: string;
  status: LotteryStatus;
  finalNumber: string;
}

interface RoundDataAndUserTickets {
  roundId: string;
  userTickets: LotteryTicket[];
  finalNumber: string;
}

const fetchDehubRewardsForTickets = async (
  winningTickets: LotteryTicket[]
): Promise<{
  ticketsWithUnclaimedRewards: LotteryTicket[];
  dehubTotal: BigNumber;
}> => {
  const calls: Call[] = winningTickets.map(winningTicket => {
    const { roundId, id, rewardBracket } = winningTicket;
    return {
      name: 'viewRewardsForTicketId',
      address: getStandardLotteryAddress(),
      params: [roundId, id, rewardBracket],
    };
  });

  try {
    const dehubRewards = await multicallv2(StandardLotteryAbi, calls);

    const dehubTotal = dehubRewards.reduce(
      (accum: BigNumber, dehubReward: ethers.BigNumber) => {
        return accum.plus(new BigNumber(dehubReward.toString()));
      },
      BIG_ZERO
    );

    const ticketsWithUnclaimedRewards = winningTickets.map(
      (winningTicket, index) => {
        return { ...winningTicket, dehubReward: dehubRewards[index] };
      }
    );

    return { ticketsWithUnclaimedRewards, dehubTotal };
  } catch (error) {
    console.error(error);
    return {
      ticketsWithUnclaimedRewards: [],
      dehubTotal: BIG_ZERO,
    };
  }
};

/**
 * Get reward bracket matched by ticket number
 * @param ticketNumber
 * @param finalNumber
 * @returns 0 = 1 match, 1 = 2 match, 2 = 3 match, 3 = all match
 */
const getRewardBracketByNumber = (
  ticketNumber: string,
  finalNumber: string
): number => {
  const ticketNumberAsArray = ticketNumber.split('').reverse();
  const winningNumbersAsArray = finalNumber.split('').reverse();
  const matchingNumbers = [];

  // ticketNumber is from 100000000 to 118181818, ignore first 1 number
  for (let idx = 0; idx < winningNumbersAsArray.length - 1; idx++) {
    if (ticketNumberAsArray[idx] !== winningNumbersAsArray[idx]) {
      break;
    }
    matchingNumbers.push(ticketNumberAsArray[idx]);
  }
  return Math.floor(matchingNumbers.length / 2) - 1;
};

const getWinningTickets = async (
  roundDataAndUserTickets: RoundDataAndUserTickets
): Promise<LotteryTicketClaimData> => {
  const { roundId, userTickets, finalNumber } = roundDataAndUserTickets;

  const ticketsWithRewardBrackets = userTickets.map(ticket => {
    return {
      id: ticket.id,
      number: ticket.number,
      claimed: ticket.claimed,
      roundId,
      rewardBracket: getRewardBracketByNumber(ticket.number, finalNumber),
    };
  });

  /**
   * @todo, it must be > 0
   */
  const allWinningTickets = ticketsWithRewardBrackets.filter(ticket => {
    return ticket.rewardBracket >= 0;
  });

  let maximumMatched = 0;
  allWinningTickets.forEach(value => {
    maximumMatched =
      maximumMatched > value.rewardBracket
        ? maximumMatched
        : value.rewardBracket;
  });

  const unclaimedWinningTickets = allWinningTickets.filter(ticket => {
    return !ticket.claimed && ticket.rewardBracket === maximumMatched;
  });

  if (unclaimedWinningTickets.length > 0) {
    const { ticketsWithUnclaimedRewards, dehubTotal } =
      await fetchDehubRewardsForTickets(unclaimedWinningTickets);
    if (dehubTotal.eq(BIG_ZERO)) {
      // it does not have claimable tickets
      /*
       * Even though numbers are matched, it could be a maximum match in the current round.
       * If not a maximum matching, claimable amount can be zero.
       */
      return {
        ticketsWithUnclaimedRewards: [],
        allWinningTickets: [],
        dehubTotal,
        roundId,
      };
    }
    return {
      ticketsWithUnclaimedRewards,
      allWinningTickets,
      dehubTotal,
      roundId,
    };
  }

  return {
    ticketsWithUnclaimedRewards: [],
    allWinningTickets,
    dehubTotal: BIG_ZERO,
    roundId,
  };
};

const fetchLotteryFinalNumbers = async (
  roundIds: string[]
): Promise<LotteryStatusAndFinalNumber[]> => {
  const calls: Call[] = roundIds.map(roundId => {
    return {
      name: 'viewLotteryDrawable',
      address: getStandardLotteryAddress(),
      params: [roundId],
    };
  });

  try {
    const statusAndFinalNumbers = await multicallv2(StandardLotteryAbi, calls);

    const finalNumbers = statusAndFinalNumbers.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (statusAndFinalNumber: any, index: number) => {
        const statusKey = Object.keys(LotteryStatus)[statusAndFinalNumber[0]];

        return {
          roundId: roundIds[index],
          status: LotteryStatus[statusKey as keyof typeof LotteryStatus],
          finalNumber: ethersToSerializedBigNumber(statusAndFinalNumber[1]),
        };
      }
    );

    return finalNumbers;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const findFinalNumberForRound = (
  targetRoundId: string,
  roundsData: LotteryStatusAndFinalNumber[]
) => {
  const targetRound = roundsData.find(
    roundData => roundData.roundId === targetRoundId
  );
  return targetRound?.finalNumber ?? '';
};

export const fetchUnclaimedUserRewards = async (
  account: string,
  lotteryId: string,
  requestSize: number
): Promise<LotteryTicketClaimData[]> => {
  if (requestSize < 1) {
    return [];
  }

  const roundId: number = parseInt(lotteryId);
  const roundsToCheck = [];
  for (let idx = 0; roundId - idx > 0 && idx < requestSize; idx++) {
    roundsToCheck.push((roundId - idx).toString());
  }

  const statusAndFinalNumbers = await fetchLotteryFinalNumbers(roundsToCheck);
  const claimableRounds = statusAndFinalNumbers.filter(statusAndFinalNumber => {
    return (
      statusAndFinalNumber.status === LotteryStatus.CLAIMABLE &&
      statusAndFinalNumber.finalNumber.length > 0
    );
  });

  if (claimableRounds.length < 1) {
    return [];
  }

  const idsToCheck = claimableRounds.map(item => item.roundId);
  const userTicketData = await fetchUserTicketsPerMultipleRounds(
    account,
    idsToCheck
  );
  const roundsWithTickets = userTicketData.filter(
    roundData => roundData.userTickets.length > 0
  );

  const roundDataAndWinningTickets = roundsWithTickets.map(
    (roundData): RoundDataAndUserTickets => {
      return {
        ...roundData,
        finalNumber: findFinalNumberForRound(
          roundData.roundId,
          claimableRounds
        ),
      };
    }
  );

  const winningTickets = await Promise.all(
    roundDataAndWinningTickets.map(roundData => getWinningTickets(roundData))
  );

  // Filter unclaimed tickets
  const roundsWithUnclaimedWinningTickets = winningTickets.filter(
    winninTicketData => winninTicketData.ticketsWithUnclaimedRewards.length > 0
  );

  return roundsWithUnclaimedWinningTickets;
};