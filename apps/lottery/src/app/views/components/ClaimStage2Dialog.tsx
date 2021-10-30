import { useEffect, useRef, useState } from 'react';
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
import { getBalanceNumber } from '@dehub/shared/utils';

import { SimpleCountDown } from './CountDown';

import { Text } from '../../components/Text';
import { TicketIdLabel } from '../../components/TicketLabel';
import { LotteryTicket } from '../../config/constants/types';
import useGetDeLottoWinningRewards, {
  FetchStatus,
} from '../../hooks/special-lottery/useGetDeLottoWinningRewards';
import { useSpecialLotteryContract } from '../../hooks/useContract';
import { useLottery } from '../../states/special-lottery/hooks';
import { utcToLocal } from '../../utils/dateHelpers';

interface ClaimStage2DialogProps {
  open: boolean;
  onHide: () => void;
}

const ClaimStage2Dialog = ({ open, onHide }: ClaimStage2DialogProps) => {
  const {
    currentLotteryId,
    currentRound: { deLottoStatus },
  } = useLottery();

  // end of month with 23:59:59
  const endOfMonthAsInt = utcToLocal(
    endOfMonth(Date.now()).getTime()
  ).getTime();

  const { fetchAllRewards, winningRewards, fetchStatus } =
    useGetDeLottoWinningRewards();
  const isFetchingRewards =
    // fetchStatus === FetchStatus.NOT_FETCHED ||
    fetchStatus === FetchStatus.IN_PROGRESS;
  const { account } = Hooks.useMoralisEthers();
  const [pendingTx, setPendingTx] = useState(false);
  const lotteryContract = useSpecialLotteryContract();
  const [claimed, setClaimed] = useState(false);

  const toast = useRef<Toast>(null);

  useEffect(() => {
    fetchAllRewards();
  }, [account, currentLotteryId, deLottoStatus, claimed, fetchAllRewards]);

  const handleClaim = async () => {
    const ticketIds = winningRewards?.ticketsWithUnclaimedRewards.map(
      (ticket: LotteryTicket, index: number) => ticket.id
    );

    setPendingTx(true);
    try {
      if (lotteryContract) {
        const tx: TransactionResponse = await lotteryContract.claimTickets(
          currentLotteryId,
          ticketIds
        );
        const receipt: TransactionReceipt = await tx.wait();
        if (receipt.status) {
          toast?.current?.show({
            severity: 'info',
            summary: 'Claim tickets',
            detail: 'Claim tickets successfully. Please check your wallet.',
            life: 3000,
          });
          setClaimed(true);
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
    setPendingTx(false);
    onHide();
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={open}
        modal
        className="p-fluid"
        header={`Round #${currentLotteryId}`}
        style={{ width: '250px' }}
        onHide={onHide}
      >
        <div className="flex flex-column">
          <div className="mb-2 flex justify-content-center">
            <Text>Unclaimed Total</Text>
          </div>
          <div className="mb-3 flex justify-content-center">
            {winningRewards ? (
              <Text className="font-bold">
                {getBalanceNumber(winningRewards.dehubTotal, DEHUB_DECIMALS)}{' '}
                $DeHub
              </Text>
            ) : (
              <Skeleton width="100%" height="2rem" />
            )}
          </div>
          <div className="mb-3 flex flex-column align-items-center">
            <Text fontSize="12px">Will be burned in:</Text>
            <SimpleCountDown limitTime={Math.floor(endOfMonthAsInt / 1000)} />
          </div>
          {isFetchingRewards ? (
            <Skeleton width="100%" height="2rem" className="mb-4" />
          ) : (
            <div className="mb-4">
              {winningRewards &&
                winningRewards.allWinningTickets.map(
                  (ticket: LotteryTicket, index: number) => {
                    return (
                      <TicketIdLabel
                        key={`${index}`}
                        id={`#${ticket.id}`}
                        className="mb-2"
                      />
                    );
                  }
                )}
              {winningRewards &&
                winningRewards.ticketsWithUnclaimedRewards.length > 0 && (
                  <div className="flex flex-column mt-5">
                    <Button
                      icon={pendingTx ? 'pi pi-spin pi-spinner' : ''}
                      className="justify-content-center"
                      onClick={() => {
                        if (pendingTx) {
                          return;
                        }
                        handleClaim();
                      }}
                      label="Claim Now"
                    />
                  </div>
                )}
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default ClaimStage2Dialog;
