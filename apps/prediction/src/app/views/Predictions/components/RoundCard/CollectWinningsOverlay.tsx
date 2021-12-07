import React from 'react';
import { Hooks } from '@dehub/react/core';
import styled from 'styled-components';
import { Flex } from '@dehub/react/pcsuikit';
import { useBetCanClaim } from '../../../../state/hooks';
import { useTranslation } from '../../../../contexts/Localization';
import Icon from '../../../../components/Icon/Icon';
import CollectWinningsButton from '../CollectWinningsButton';

interface CollectWinningsOverlayProps {
  roundId: string;
  epoch: number;
  payout: number | null;
  isBottom?: boolean;
}

const Wrapper = styled(Flex)<{
  isBottom: CollectWinningsOverlayProps['isBottom'];
}>`
  background-color: rgb(41, 50, 65);
  left: 0;
  position: absolute;
  width: 100%;
  z-index: 30;

  ${({ isBottom }) => {
    return isBottom
      ? `
      border-radius: 0 0 6px 6px;
      bottom: 0;
    `
      : `
      top: 37px; // Card header height
    `;
  }}
`;

const CollectWinningsOverlay: React.FC<CollectWinningsOverlayProps> = ({
  roundId,
  epoch,
  payout,
  isBottom = false,
  ...props
}) => {
  const { account } = Hooks.useMoralisEthers();
  const { t } = useTranslation();
  const canClaim = useBetCanClaim(account, roundId);

  if (!canClaim) {
    return null;
  }

  return (
    <Wrapper alignItems="center" p="16px" isBottom={isBottom} {...props}>
      <Icon
        className="fad fa-trophy-alt pr-2"
        size="34px"
        style={{ flex: 'none', marginRight: '8px', color: '#FFD800' }}
      ></Icon>
      <CollectWinningsButton
        payout={payout}
        roundId={roundId}
        epoch={epoch}
        hasClaimed={false}
        width="100%"
        height="50px"
      >
        {t('Collect Winnings')}
      </CollectWinningsButton>
    </Wrapper>
  );
};

export default CollectWinningsOverlay;