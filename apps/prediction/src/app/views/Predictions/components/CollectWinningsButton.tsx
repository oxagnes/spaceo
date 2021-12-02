import React from 'react';
import styled from 'styled-components';
import { Button, ButtonProps, useModal } from '@dehub/react/pcsuikit';
import CollectRoundWinningsModal from './CollectRoundWinningsModal';

interface CollectWinningsButtonProps extends ButtonProps {
  payout: number | null;
  roundId: string;
  epoch: number;
  hasClaimed: boolean;
  onSuccess?: () => Promise<void>;
}

const CollectWinningsButton: React.FC<CollectWinningsButtonProps> = ({
  payout,
  roundId,
  epoch,
  hasClaimed,
  onSuccess,
  children,
  ...props
}) => {
  const [onPresentCollectWinningsModal] = useModal(
    <CollectRoundWinningsModal
      payout={payout}
      roundId={roundId}
      epoch={epoch}
      onSuccess={onSuccess}
    />,
    false
  );

  return (
    <Button
      onClick={onPresentCollectWinningsModal}
      disabled={hasClaimed}
      {...props}
      scale="sm"
      style={{ background: '#622f88', fontWeight: 400, borderRadius: '8px' }}
    >
      {children}
    </Button>
  );
};

export default CollectWinningsButton;
