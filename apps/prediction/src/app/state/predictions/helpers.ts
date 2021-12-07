/* eslint-disable multiline-comment-style */
import {
  Bet,
  BetPosition,
  Market,
  PredictionStatus,
  Round,
  RoundData,
} from '../types';
import { getPredictionsContract } from '../../utils/contractHelpers';
import { BetResponse, RoundResponse, MarketResponse } from './queries';
import { fetchBetHistory } from './helpers2';

export enum Result {
  WIN = 'win',
  LOSE = 'lose',
  CANCELED = 'canceled',
  LIVE = 'live',
}

export const numberOrNull = (value: string | null) => {
  if (value === null) {
    return null;
  }

  const valueNum = Number(value);
  return Number.isNaN(valueNum) ? null : valueNum;
};

export const makeFutureRoundResponse = (
  epoch: number,
  startBlock: number
): RoundResponse => {
  return {
    id: epoch.toString(),
    epoch: epoch.toString(),
    startBlock: startBlock.toString(),
    failed: null,
    startAt: null,
    lockAt: null,
    lockBlock: null,
    lockPrice: null,
    endBlock: null,
    closePrice: null,
    totalBets: '0',
    totalAmount: '0',
    bearBets: '0',
    bullBets: '0',
    bearAmount: '0',
    bullAmount: '0',
    position: null,
    bets: [],
  };
};

export const transformBetResponse = (betResponse: BetResponse): Bet => {
  const bet = {
    id: betResponse.id,
    hash: betResponse.hash,
    amount: betResponse.amount ? parseFloat(betResponse.amount) : 0,
    position:
      betResponse.position === 'Bull' ? BetPosition.BULL : BetPosition.BEAR,
    claimed: betResponse.claimed,
    user: {
      id: betResponse?.user?.id,
      address: betResponse?.user?.address,
      block: numberOrNull(betResponse?.user?.block as string),
      totalBets: numberOrNull(betResponse?.user?.totalBets as string),
      totalETH: numberOrNull(betResponse?.user?.totalETH as string),
    },
  } as Bet;

  if (betResponse.round) {
    bet.round = transformRoundResponse(betResponse.round);
  }

  return bet;
};

export const transformRoundResponse = (roundResponse: RoundResponse): Round => {
  const {
    id,
    epoch,
    failed,
    startBlock,
    startAt,
    lockAt,
    lockBlock,
    lockPrice,
    endBlock,
    closePrice,
    totalBets,
    totalAmount,
    bullBets,
    bearBets,
    bearAmount,
    bullAmount,
    position,
    bets = [],
  } = roundResponse;

  const getRoundPosition = (positionResponse: string | null) => {
    if (positionResponse === 'Bull') {
      return BetPosition.BULL;
    }

    if (positionResponse === 'Bear') {
      return BetPosition.BEAR;
    }

    return null;
  };

  return {
    id,
    failed: failed as boolean,
    epoch: numberOrNull(epoch) as number,
    startBlock: numberOrNull(startBlock as string) as number,
    startAt: numberOrNull(startAt) as number,
    lockAt: numberOrNull(lockAt) as number,
    lockBlock: numberOrNull(lockBlock) as number,
    lockPrice: (lockPrice ? parseFloat(lockPrice) : null) as number,
    endBlock: numberOrNull(endBlock) as number,
    closePrice: (closePrice ? parseFloat(closePrice) : null) as number,
    totalBets: numberOrNull(totalBets) as number,
    totalAmount: (totalAmount ? parseFloat(totalAmount) : 0) as number,
    bullBets: numberOrNull(bullBets) as number,
    bearBets: numberOrNull(bearBets) as number,
    bearAmount: numberOrNull(bearAmount) as number,
    bullAmount: numberOrNull(bullAmount) as number,
    position: getRoundPosition(position) as BetPosition,
    bets: bets.map(transformBetResponse),
  };
};

export const transformMarketResponse = (
  marketResponse: MarketResponse
): Market => {
  return {
    id: marketResponse.id,
    paused: marketResponse.paused,
    epoch: Number(marketResponse.epoch.epoch),
  };
};

export const makeRoundData = (rounds: Round[]): RoundData => {
  return rounds.reduce((accum, round) => {
    return {
      ...accum,
      [round.id]: round,
    };
  }, {});
};

export const getRoundResult = (bet: Bet, currentEpoch: number): Result => {
  const { round } = bet;
  if (round.failed) {
    return Result.CANCELED;
  }

  if (round.epoch >= currentEpoch - 1) {
    return Result.LIVE;
  }
  const roundResultPosition =
    round.closePrice > round.lockPrice ? BetPosition.BULL : BetPosition.BEAR;

  return bet.position === roundResultPosition ? Result.WIN : Result.LOSE;
};

/**
 * Given a bet object, check if it is eligible to be claimed or refunded
 */
export const getCanClaim = (bet: Bet) => {
  return (
    !bet.claimed &&
    (bet.position === bet.round.position || bet.round.failed === true)
  );
};

/**
 * Returns only bets where the user has won.
 * This is necessary because the API currently cannot distinguish between an uncliamed bet that has won or lost
 */
export const getUnclaimedWinningBets = (bets: Bet[]): Bet[] => {
  return bets.filter(getCanClaim);
};

/**
 * Gets static data from the contract
 */
export const getStaticPredictionsData = async () => {
  const contract = getPredictionsContract();

  const currentEpoch = await contract.currentEpoch();
  const intervalBlocks = await contract.intervalBlocks();
  const minBetAmount = await contract.minBetAmount();
  const isPaused = await contract.paused();
  const bufferBlocks = await contract.bufferBlocks();
  const rewardRate = await contract.rewardRate();
  const totalRate = await contract.TOTAL_RATE();

  return {
    status: isPaused ? PredictionStatus.PAUSED : PredictionStatus.LIVE,
    currentEpoch: Number(currentEpoch),
    intervalBlocks: intervalBlocks.toNumber(),
    bufferBlocks: Number(bufferBlocks),
    minBetAmount: minBetAmount.toString(),
    rewardRate: Number(rewardRate),
    totalRate: Number(totalRate),
  };
};

// export const getMarketData = async (): Promise<{
//   rounds: Round[];
//   market: Market;
// }> => {
//   const response = (await request(
//     GRAPH_API_PREDICTION as string,
//     gql`
//       query getMarketData {
//         rounds(first: 5, orderBy: epoch, orderDirection: desc) {
//           ${getRoundBaseFields()}
//         }
//         market(id: 1) {
//           id
//           paused
//           epoch {
//             epoch
//           }
//         }
//       }
//     `
//   )) as { rounds: RoundResponse[]; market: MarketResponse };

//   return {
//     rounds: response.rounds.map(transformRoundResponse),
//     market: transformMarketResponse(response.market),
//   };
// };

export const getBetHistory = async (
  user: string,
  claimed?: boolean
): Promise<BetResponse[]> => {
  const contract = getPredictionsContract();

  const currentEpoch = await contract.currentEpoch();
  const userRounds = await contract.getUserRounds(
    user,
    Math.max(Number(currentEpoch) - 1400, 0),
    Number(currentEpoch)
  );
  const history = await fetchBetHistory({
    user: user.toString(),
    round_in: userRounds[0].toString().split(','),
  });

  return history.filter(a => claimed === undefined || claimed === a.claimed);
};

export const getBet = async (
  user: string,
  betId: string
): Promise<BetResponse | null> => {
  const history = await fetchBetHistory({
    user: user,
    round_in: [`${betId.split('_')[1]}`],
  });

  if (history && history.length > 0) {
    return history[0];
  } else {
    return null;
  }
};