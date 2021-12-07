import React from 'react';
import {
  CardBody,
  Flex,
  WaitIcon,
  TooltipText,
  useTooltip,
  InfoIcon,
} from '@dehub/react/pcsuikit';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useTranslation } from '../../../../contexts/Localization';
import { Round, BetPosition } from '../../../../state/types';
import { useGetTotalIntervalBlocks } from '../../../../state/hooks';
import { RoundResultBox } from '../RoundResult';
import MultiplierArrow from './MultiplierArrow';
import Card from './Card';
import CardHeader from './CardHeader';

interface CalculatingCardProps {
  round: Round;
}

const CalculatingCard: React.FC<CalculatingCardProps> = ({ round }) => {
  const { t } = useTranslation();
  const interval = useGetTotalIntervalBlocks();
  const estimatedEndBlock = (round.startBlock as number) + interval;
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t(
      'This round’s closing transaction has been submitted to the blockchain, and is awaiting confirmation.'
    ),
    { placement: 'bottom' }
  );

  return (
    <>
      <Card className="border-neon-2">
        <CardHeader
          status="calculating"
          icon={<WaitIcon mr="4px" width="21px" />}
          title={t('Calculating')}
          epoch={round.epoch as number}
          blockNumber={estimatedEndBlock}
        />
        <CardBody p="16px">
          <MultiplierArrow isDisabled />
          <RoundResultBox>
            <Flex
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
              <Flex mt="8px" ref={targetRef}>
                <TooltipText>{t('Calculating')}</TooltipText>
                <InfoIcon ml="4px" />
              </Flex>
            </Flex>
          </RoundResultBox>
          <MultiplierArrow betPosition={BetPosition.BEAR} isDisabled />
        </CardBody>
      </Card>
      {tooltipVisible && tooltip}
    </>
  );
};

export default CalculatingCard;