import React, { ReactElement } from 'react';
import { Flex, Text } from '@dehub/react/pcsuikit';
import styled, { DefaultTheme } from 'styled-components';

type Status = 'expired' | 'live' | 'next' | 'soon' | 'canceled' | 'calculating';

interface CardHeaderProps {
  status: Status;
  title: string;
  epoch: number;
  blockNumber: number;
  icon?: ReactElement;
}

const getBackgroundColor = (theme: DefaultTheme, status: Status) => {
  switch (status) {
    case 'calculating':
      return theme.colors.gradients.cardHeader;
    case 'live':
      return 'transparent';
    case 'canceled':
      return theme.colors.warning;
    case 'next':
      return theme.colors.secondary;
    case 'expired':
    case 'soon':
    default:
      return theme.colors.cardBorder;
  }
};

type TextColor = 'textDisabled' | 'white' | 'secondary' | 'text' | 'textSubtle';
type FallbackColor = 'text' | 'textSubtle';

const getTextColorByStatus = (
  status: Status,
  fallback: FallbackColor
): TextColor => {
  // eslint-disable-next-line multiline-comment-style
  // switch (status) {
  //   case 'expired':
  //     return 'textDisabled';
  //   case 'next':
  //     return 'white';
  //   case 'live':
  //     return 'secondary';
  //   case 'canceled':
  //   case 'calculating':
  //     return 'text';
  //   default:
  //     return fallback;
  // }
  return 'white';
};

const StyledCardHeader = styled.div<{ status: Status }>`
  align-items: center;
  background: ${({ status }) =>
    status === 'live' || status === 'calculating'
      ? 'rgba(255, 216, 0, 0.8)'
      : 'transparent'};
  border-radius: 0;
  display: flex;
  justify-content: space-between;
  padding: ${({ status }) => (status === 'live' ? '16px' : '8px')};
`;

const Round = styled.div`
  justify-self: center;
`;

const CardHeader: React.FC<CardHeaderProps> = ({
  status,
  title,
  epoch,
  icon,
}) => {
  const textColor = getTextColorByStatus(status, 'text');
  const isLive = status === 'live';

  return (
    <StyledCardHeader status={status}>
      <Flex alignItems="center">
        {icon}
        <Text
          color={textColor}
          bold={isLive}
          textTransform={isLive ? 'uppercase' : 'capitalize'}
          lineHeight="21px"
        >
          {title}
        </Text>
      </Flex>
      <Round>
        <Text
          fontSize={isLive ? '14px' : '12px'}
          color={getTextColorByStatus(status, 'textSubtle')}
          textAlign="center"
        >
          {`#${epoch}`}
        </Text>
      </Round>
    </StyledCardHeader>
  );
};

export default CardHeader;