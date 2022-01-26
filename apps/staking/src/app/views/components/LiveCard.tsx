import { Hooks } from '@dehub/react/core';
import {
  BNB_DECIMALS,
  BUSD_DISPLAY_DECIMALS,
  DEHUB_DECIMALS,
  DEHUB_DISPLAY_DECIMALS,
} from '@dehub/shared/config';
import { BIG_ZERO, getFullDisplayBalance } from '@dehub/shared/utils';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import ConnectWalletButton from '../../components/ConnectWalletButton';
import Box from '../../components/Layout/Box';
import { Header, Text } from '../../components/Text';
import { FetchStatus } from '../../config/constants/types';
import {
  useRewardsContract,
  useStakingContract,
} from '../../hooks/useContract';
import { useStakePaused } from '../../hooks/usePaused';
import { useWeeklyRewards } from '../../hooks/useRewards';
import { usePendingHarvest, useStakes } from '../../hooks/useStakes';
import { useDehubBusdPrice, usePoolInfo } from '../../state/application/hooks';
import { timeFromNow } from '../../utils/timeFromNow';
import StakeModal from './StakeModal';

const StyledBox = styled(Box)`
  padding: 1rem;
`;

const LiveCard = () => {
  const currentQ = `Q${moment().quarter()} ${moment().year()}`;
  const isIn2022Q1 = moment().quarter() === 1 && moment().year() === 2022;

  const [openStakeModal, setOpenStakeModal] = useState<boolean>(false);
  const [openUnstakeModal, setOpenUnstakeModal] = useState<boolean>(false);
  const [claimed, setClaimed] = useState(false);
  const [pendingClaimTx, setPendingClaimTx] = useState(false);

  const stakingContract = useStakingContract();
  const rewardsContract = useRewardsContract();
  const paused = useStakePaused();
  const { account } = Hooks.useMoralisEthers();
  const poolInfo = usePoolInfo();
  const closeTimeStamp = poolInfo
    ? Number(poolInfo.closeTimeStamp) * 1000
    : '0';

  const { fetchStatus: fetchStakeStatus, userInfo: userStakeInfo } =
    useStakes(account);
  const pendingHarvest = usePendingHarvest(account);

  const period = poolInfo
    ? poolInfo?.closeTimeStamp - poolInfo?.openTimeStamp
    : undefined;
  const remainTimes = poolInfo
    ? moment(new Date(poolInfo?.closeTimeStamp * 1000)).unix() -
      new Date().getTime() / 1000
    : undefined;
  const projectedRewards =
    poolInfo && pendingHarvest && remainTimes && period
      ? pendingHarvest
          ?.times(new BigNumber(period))
          .div(new BigNumber(remainTimes))
      : undefined;

  const {
    fetchBNBRewards,
    fetchStatus: fetchRewardStatus,
    bnbRewards,
    totalBNBRewards,
    isClaimable,
  } = useWeeklyRewards(account);

  const deHubPriceInBUSD = useDehubBusdPrice();

  const projectedRewardsInBUSD = projectedRewards?.times(deHubPriceInBUSD);

  const toast = useRef<Toast>(null);

  useEffect(() => {
    fetchBNBRewards(userStakeInfo?.amount);
  }, [account, userStakeInfo, claimed]);

  const handleModal = (modal: string, showOrHide: boolean) => {
    if (modal === 'stake') {
      setOpenStakeModal(showOrHide);
    } else if (modal === 'unstake') {
      setOpenUnstakeModal(showOrHide);
    }
  };

  const handleClaimBNB = async () => {
    setPendingClaimTx(true);
    try {
      if (userStakeInfo.amount.eq(BIG_ZERO)) {
        if (rewardsContract) {
          const tx: TransactionResponse = await rewardsContract?.claimReward();
          const receipt: TransactionReceipt = await tx.wait();
          if (receipt.status) {
            toast?.current?.show({
              severity: 'info',
              summary: 'Claim rewards',
              detail: 'Claimed rewards successfully. Please check your wallet.',
              life: 4000,
            });
            setClaimed(true);
          }
        }
      } else if (stakingContract) {
        const tx: TransactionResponse =
          await stakingContract?.claimBNBRewards();
        const receipt: TransactionReceipt = await tx.wait();
        if (receipt.status) {
          toast?.current?.show({
            severity: 'info',
            summary: 'Claim rewards',
            detail: 'Claimed rewards successfully. Please check your wallet.',
            life: 4000,
          });
          setClaimed(true);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast?.current?.show({
        severity: 'error',
        summary: 'Claim rewards',
        detail: `Claim rewards failed - ${
          error?.data?.message ?? error.message
        }`,
        life: 4000,
      });
    }
    setPendingClaimTx(false);
  };

  return (
    <>
      <Toast ref={toast} />
      <Card className="border-neon-2 overflow-hidden mt-5">
        <StyledBox>
          <>
            <Header
              className="py-2 px-3 inline-flex border-neon-2"
              style={{
                borderRadius: '8px',
                background:
                  'linear-gradient(50deg, rgba(89,70,0,1) 0%, rgba(193,160,49,1) 48%, rgba(89,70,0,1) 100%)',
              }}
            >
              <span style={{ fontWeight: 900 }}>
                {paused ? `Paused: ${currentQ}` : `Live: ${currentQ}`}
              </span>
            </Header>

            <div className="grid mt-2">
              <div className="col-12 md:col-6 lg:col-6">
                <div className="card overview-box gray shadow-2">
                  <div className="overview-info text-left w-full">
                    <Header className="pb-1">Harvest In</Header>
                    <Text fontSize="24px" fontWeight={900}>
                      {timeFromNow(moment(new Date(closeTimeStamp)))}
                    </Text>
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-6 lg:col-6 align-self-start">
                <div className="card overview-box gray shadow-2">
                  <div className="overview-info text-left w-full">
                    <Header className="pb-1">Projected Rewards</Header>
                    {projectedRewards &&
                    projectedRewardsInBUSD &&
                    !projectedRewardsInBUSD.isNaN() ? (
                      <>
                        <Text fontSize="24px" fontWeight={900}>
                          {getFullDisplayBalance(
                            projectedRewards,
                            DEHUB_DECIMALS,
                            DEHUB_DISPLAY_DECIMALS
                          )}
                          <span className="pl-2" style={{ fontSize: '14px' }}>
                            $DeHub
                          </span>
                        </Text>
                        <Text>
                          $
                          {getFullDisplayBalance(
                            projectedRewardsInBUSD,
                            DEHUB_DECIMALS,
                            BUSD_DISPLAY_DECIMALS
                          )}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Skeleton width="100%" height="1.5rem" />
                        <Skeleton
                          width="100%"
                          height="1.5rem"
                          className="mt-2"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid mt-2">
              <div className="col-12 md:col-6 lg:col-6 align-self-start">
                <div className="card overview-box gray shadow-2">
                  <div className="overview-info text-left w-full">
                    <Header className="pb-1">Your Stake</Header>
                    {fetchStakeStatus === FetchStatus.SUCCESS && poolInfo ? (
                      <>
                        <Text fontSize="24px" fontWeight={900}>
                          {getFullDisplayBalance(
                            userStakeInfo.amount,
                            DEHUB_DECIMALS
                          )}
                        </Text>
                        <Text fontWeight={900} className="pb-2">
                          {poolInfo.totalStaked.gt(BIG_ZERO)
                            ? userStakeInfo.amount
                                .times(new BigNumber(100))
                                .div(poolInfo.totalStaked)
                                .toNumber()
                                .toFixed(2)
                            : Number(0).toFixed(2)}
                          % of the total pool
                        </Text>
                        <Button
                          className="p-button mt-2 justify-content-center w-4 mr-3"
                          onClick={() => handleModal('stake', true)}
                          disabled={paused}
                          label="Stake"
                        />
                        <Button
                          className="p-button-outlined mt-2 justify-content-center w-4 text-white border-primary"
                          onClick={() => handleModal('unstake', true)}
                          disabled={paused}
                          label="Unstake"
                        />
                      </>
                    ) : (
                      <>
                        <Skeleton width="100%" height="1.5rem" />
                        <Skeleton
                          width="100%"
                          height="1.5rem"
                          className="mt-2"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 md:col-6 lg:col-6">
                <div className="card overview-box gray shadow-2">
                  <div className="overview-info text-left w-full">
                    <Header className="pb-1">Pending Rewards</Header>
                    {pendingHarvest ? (
                      <>
                        <Text fontSize="24px" fontWeight={900}>
                          {getFullDisplayBalance(
                            pendingHarvest,
                            DEHUB_DECIMALS,
                            DEHUB_DISPLAY_DECIMALS
                          )}
                        </Text>
                        <Text>$DeHub</Text>
                      </>
                    ) : (
                      <>
                        <Skeleton width="100%" height="1.5rem" />
                        <Skeleton
                          width="100%"
                          height="1.5rem"
                          className="mt-2"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid mt-2">
              <div className="col-12 md:col-12 lg:col-12 align-self-start">
                <div className="card overview-box gray shadow-2">
                  <div className="overview-info text-left w-full">
                    <Header className="pb-2">Weekly BNB Rewards</Header>
                    {account &&
                      (fetchRewardStatus === FetchStatus.SUCCESS ? (
                        <Text fontSize="14px" fontWeight={900} className="pb-2">
                          Your BNB Reward:{' '}
                          {getFullDisplayBalance(bnbRewards, BNB_DECIMALS, 10)}
                        </Text>
                      ) : (
                        <Skeleton width="100%" height="1.5rem" />
                      ))}
                    {totalBNBRewards ? (
                      <>
                        <Text fontSize="14px" fontWeight={900} className="pb-2">
                          Total BNB Reward Pool:{' '}
                          {getFullDisplayBalance(
                            totalBNBRewards,
                            BNB_DECIMALS,
                            10
                          )}
                        </Text>
                      </>
                    ) : (
                      <Skeleton width="100%" height="1.5rem" className="mt-2" />
                    )}

                    {account ? (
                      <Button
                        className="p-button mt-2 justify-content-center w-5"
                        disabled={paused || !isClaimable}
                        onClick={handleClaimBNB}
                        label="Claim BNB"
                        loading={pendingClaimTx}
                        loadingIcon={'pi pi-spin pi-spinner'}
                      />
                    ) : (
                      <ConnectWalletButton />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        </StyledBox>
      </Card>
      <StakeModal
        id="stake"
        open={openStakeModal}
        onHide={() => handleModal('stake', false)}
      />
      <StakeModal
        id="unstake"
        open={openUnstakeModal}
        onHide={() => handleModal('unstake', false)}
      />
    </>
  );
};

export default LiveCard;
