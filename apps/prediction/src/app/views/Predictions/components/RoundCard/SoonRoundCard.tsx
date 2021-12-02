import React from 'react';
import { CardBody, Text, WaitIcon } from '@dehub/react/pcsuikit';
import { useTranslation } from '../../../../contexts/Localization';
import { Round, BetPosition } from '../../../../state/types';
import {
  useGetCurrentEpoch,
  useGetTotalIntervalBlocks,
} from '../../../../state/hooks';
import { formatRoundTime } from '../../helpers';
import useRoundCountdown from '../../hooks/useRoundCountdown';
import { RoundResultBox } from '../RoundResult';
import MultiplierArrow from './MultiplierArrow';
import Card from './Card';
import CardHeader from './CardHeader';

interface SoonRoundCardProps {
  round: Round;
}

const SoonRoundCard: React.FC<SoonRoundCardProps> = ({ round }) => {
  const { t } = useTranslation();
  const interval = useGetTotalIntervalBlocks();
  const currentEpoch = useGetCurrentEpoch();
  const estimatedEndBlock = (round.startBlock as number) + interval;
  const seconds = useRoundCountdown((round.epoch as number) - currentEpoch + 1);
  const countdown = formatRoundTime(seconds);

  return (
    <Card className="border-neon-1">
      <CardHeader
        status="soon"
        icon={<WaitIcon mr="4px" width="21px" />}
        title={t('Later')}
        epoch={round.epoch as number}
        blockNumber={estimatedEndBlock}
      />
      <CardBody p="16px">
        <MultiplierArrow isDisabled />
        <RoundResultBox>
          <Text textAlign="center">
            <Text bold>{t('Entry starts')}</Text>
            <Text fontSize="24px" bold>
              {`~${countdown}`}
            </Text>
          </Text>
        </RoundResultBox>
        <MultiplierArrow betPosition={BetPosition.BEAR} isDisabled />
      </CardBody>
    </Card>
  );
};

export default SoonRoundCard;
