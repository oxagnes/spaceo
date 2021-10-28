import { useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { endOfMonth } from 'date-fns';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';

import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { Hooks } from '@dehub/react/core';
import { DEHUB_DECIMALS } from '@dehub/shared/config';
import { BIG_ZERO, getBalanceNumber } from '@dehub/shared/utils';

import { SimpleCountDown } from './CountDown';

import { Text } from '../../components/Text';
import { TicketNumberLabel } from '../../components/TicketLabel';
import { LotteryTicket } from '../../config/constants/types';
import { useStandardLotteryContract } from '../../hooks/useContract';
import { useAppDispatch } from '../../states';
import { fetchUserData } from '../../states/standard-lottery';
import {
  useLottery,
  useGetUserLotteryData,
  useGetUserLotteryDataLoading,
} from '../../states/standard-lottery/hooks';
import { LotteryUserRound } from '../../states/standard-lottery/types';

interface ClaimStage1DialogProps {
  open: boolean;
  onHide: () => void;
}

const ClaimStage1Dialog = ({ open, onHide }: ClaimStage1DialogProps) => {
  const dispatch = useAppDispatch();
  const { currentLotteryId } = useLottery();

  const { dehubTotal, rounds: unclaimedRewards } = useGetUserLotteryData();
  const isFetchingRewards = useGetUserLotteryDataLoading();

  const endOfMonthAsInt = endOfMonth(new Date()).getTime(); // end of month with 23:59:59
  const { account } = Hooks.useMoralisEthers();
  const [pendingTx, setPendingTx] = useState(-1);
  const lotteryContract = useStandardLotteryContract();
  const toast = useRef<Toast>(null);

  const unclaimedDehubTotal = new BigNumber(dehubTotal);

  const parseUnclaimedTicketDataOrClaimCall = (
    ticketWithUnclaimedRewards: LotteryTicket[],
    lotteryId: string
  ) => {
    const ticketIds = ticketWithUnclaimedRewards.map(
      (ticket: LotteryTicket) => ticket.id
    );
    const brackets = ticketWithUnclaimedRewards.map(
      (ticket: LotteryTicket) => ticket.rewardBracket
    );
    return { lotteryId, ticketIds, brackets };
  };

  const handleClaim = async (index: number) => {
    if (index >= unclaimedRewards.length) {
      return;
    }

    const activeClaimData = unclaimedRewards[index];
    const { lotteryId, ticketIds, brackets } =
      parseUnclaimedTicketDataOrClaimCall(
        activeClaimData.ticketsWithUnclaimedRewards,
        activeClaimData.roundId
      );
    setPendingTx(index);
    try {
      if (lotteryContract) {
        const tx: TransactionResponse = await lotteryContract.claimTickets(
          lotteryId,
          ticketIds,
          brackets
        );
        const receipt: TransactionReceipt = await tx.wait();
        if (receipt.status) {
          dispatch(
            fetchUserData({
              account: account ?? '',
              currentLotteryId: lotteryId ?? '',
            })
          );
          toast?.current?.show({
            severity: 'info',
            summary: 'Claim tickets',
            detail: 'Claim tickets successfully. Please check your wallet.',
            life: 3000,
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast?.current?.show({
        severity: 'error',
        summary: 'Claim tickets',
        detail: `Claim tickets failed - ${
          // eslint-disable-next-line
          error?.data?.message ?? error.message
        }`,
        life: 3000,
      });
    }
    setPendingTx(-1);
    onHide();
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={open}
        modal
        className="p-fluid"
        header={`Unclaimed Winnings`}
        style={{ width: '250px' }}
        onHide={onHide}
      >
        <div className="flex flex-column">
          <div className="mb-2 flex justify-content-center">
            <Text>Unclaimed Total</Text>
          </div>
          <div className="mb-3 flex justify-content-center">
            {!isFetchingRewards ? (
              <Text className="font-bold">
                {getBalanceNumber(unclaimedDehubTotal, DEHUB_DECIMALS)} $DeHub
              </Text>
            ) : (
              <Skeleton width="100%" height="2rem" />
            )}
          </div>
          <div className="mb-3 flex flex-column align-items-center">
            <Text fontSize="12px">Will be burned in:</Text>
            <SimpleCountDown limitTime={endOfMonthAsInt} />
          </div>
          {isFetchingRewards ? (
            <Skeleton width="100%" height="2rem" className="mb-3" />
          ) : (
            unclaimedRewards.map(
              (claimData: LotteryUserRound, index: number) => {
                if (claimData.ticketsWithUnclaimedRewards.length < 1)
                  return null;
                return (
                  <div key={`${index}`} className="mt-2 mb-2">
                    <div className="mb-2">
                      <Text>Round #{claimData.roundId}</Text>
                    </div>
                    {claimData.ticketsWithUnclaimedRewards.map(
                      (ticket: LotteryTicket, index: number) => {
                        const ticketAsInt = parseInt(ticket.number, 10);
                        return (
                          <TicketNumberLabel
                            key={`${index}`}
                            number={ticketAsInt}
                            rewardBracket={ticket.rewardBracket}
                            className="mb-2"
                          />
                        );
                      }
                    )}
                    {claimData.ticketsWithUnclaimedRewards.length > 0 &&
                      unclaimedDehubTotal.gt(BIG_ZERO) && (
                        <div className="flex flex-column mt-5">
                          <Button
                            icon={
                              pendingTx === index ? 'pi pi-spin pi-spinner' : ''
                            }
                            className="justify-content-center"
                            onClick={() => {
                              if (pendingTx >= 0) {
                                return;
                              }
                              handleClaim(index);
                            }}
                            label="Claim Now"
                          />
                        </div>
                      )}
                  </div>
                );
              }
            )
          )}
        </div>
      </Dialog>
    </>
  );
};

export default ClaimStage1Dialog;
