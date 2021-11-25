import { TabPanel, TabView } from 'primereact/tabview';
import styled from 'styled-components';
import { environment } from '../../environments/environment';
import Box from '../components/Layout/Box';
import Container from '../components/Layout/Container';
import { LoadingStatus, LotteryStatus } from '../config/constants/types';
import useSpecialLotteryStatusTransitions from '../hooks/special-raffle/useStatusTransitions';
import useStandardLotteryStatusTransitions from '../hooks/standard-raffle/useStatusTransitions';
import { usePullBusdPrice } from '../states/application/hooks';
import {
  useFetchPaused,
  useGetSpecialPaused,
  useGetStandardPaused,
} from '../states/pause/hooks';
import {
  useFetchLottery as useFetchSpecialLottery,
  useLottery as useSpecialLottery,
} from '../states/special-raffle/hooks';
import {
  useFetchLottery as useFetchStandardLottery,
  useLottery as useStandardLottery,
} from '../states/standard-raffle/hooks';
import FlexLine from './components/FlexLine';
import DeLottoStage1 from './DeLottoStage1';
import DeLottoStage1Waiting from './DeLottoStage1Waiting';
import DeLottoStage2 from './DeLottoStage2';
import DeLottoStage2Waiting from './DeLottoStage2Waiting';
import SyncWaiting from './SyncWaiting';

const StyledContainer = styled(Container)`
  .p-tabview .p-tabview-nav li {
    width: 50%;
  }
`;

const StyledBox = styled(Box)`
  padding: 1rem;
`;

const DeLotto = () => {
  // pause status
  useFetchPaused();

  usePullBusdPrice();

  // standard raffle
  useFetchStandardLottery();
  useStandardLotteryStatusTransitions();

  // special raffle
  useFetchSpecialLottery();
  useSpecialLotteryStatusTransitions();

  const {
    currentRound: {
      lotteryId: standardLotteryId,
      status: standardStatus,
      endTime: standardEndTime,
    },
  } = useStandardLottery();
  const {
    currentRound: {
      lotteryId: specialLotteryId,
      deLottoStatus: specialStatus,
      endTime: specialEndTime,
    },
  } = useSpecialLottery();
  const standardEndTimeAsInt = parseInt(standardEndTime, 10);
  const specialEndTimeAsInt = parseInt(specialEndTime, 10);
  const standardPaused = useGetStandardPaused();
  const specialPaused = useGetSpecialPaused();
  const now = new Date();

  const path = environment.baseUrl;

  /**
   * If standardEndTimeAsInt is equal to specialEndTimeAsInt,
   * means that waiting to start first round
   */
  const isActiveStage1 = standardEndTimeAsInt > specialEndTimeAsInt;
  const isActiveStage2 = standardEndTimeAsInt < specialEndTimeAsInt;
  /**
   * If both first stage and second stage are not active,
   * it will compare if current date is at the time of second stage and
   * show active tab.
   */
  const activeIndex =
    !isActiveStage1 && isActiveStage2
      ? 1
      : isActiveStage1 && !isActiveStage2
      ? 0
      : now.getUTCDate() >= // If waiting to start our first round
        (now.getUTCMonth() === 1
          ? environment.deGrandStartDayOnFebruary
          : environment.deGrandStartDay)
      ? 0 // if today is 26th ~ 31th, we are waiting first stage
      : 1;

  const isSyncStage1 = standardLotteryId && !isNaN(standardEndTimeAsInt);
  const isSyncStage2 = specialLotteryId && !isNaN(specialEndTimeAsInt);

  const loadingStatus =
    standardStatus === LotteryStatus.PENDING &&
    specialStatus === LotteryStatus.PENDING &&
    !isSyncStage1 &&
    !isSyncStage2
      ? LoadingStatus.LOADING
      : standardPaused || specialPaused
      ? LoadingStatus.PAUSED
      : isSyncStage1 && isSyncStage2
      ? LoadingStatus.COMPLETE
      : LoadingStatus.SYNCHRONIZING;

  return (
    <StyledContainer>
      <FlexLine className="md:flex-column align-items-start justify-content-between">
        <img
          src={`${path}/assets/img/deraffles-logo.png`}
          className="anim-float-4"
          alt="DeRaffles Logo"
          style={{ maxWidth: '200px' }}
        />
      </FlexLine>
      {loadingStatus !== LoadingStatus.COMPLETE ? (
        <SyncWaiting loadingStatus={loadingStatus} />
      ) : (
        <TabView activeIndex={activeIndex}>
          <TabPanel header="STAGE ONE" contentStyle={{ minHeight: '30rem' }}>
            <StyledBox>
              {isActiveStage1 ? <DeLottoStage1 /> : <DeLottoStage1Waiting />}
            </StyledBox>
          </TabPanel>

          <TabPanel header="STAGE TWO" contentStyle={{ minHeight: '30rem' }}>
            {isActiveStage2 ? (
              <StyledBox>
                <DeLottoStage2 />
              </StyledBox>
            ) : (
              <DeLottoStage2Waiting />
            )}
          </TabPanel>
        </TabView>
      )}
    </StyledContainer>
  );
};

export default DeLotto;