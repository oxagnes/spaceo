import React from 'react';
import { Box } from '../Layout';
import { Text } from '../Text';
import { StyledBalanceInput, StyledInput, UnitContainer } from './styles';
import { BalanceInputProps } from './types';

const BalanceInput = ({
  value,
  onUserInput,
  currencyValue,
  placeholder = '0.0',
  innerRef,
  inputProps,
  isWarning = false,
  decimals = 18,
  unit,
  ...props
}: BalanceInputProps) => {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.validity.valid) {
      onUserInput(e.currentTarget.value.replace(/,/g, '.'));
    }
  };

  return (
    <StyledBalanceInput data-is-warning={isWarning} {...props}>
      <div className="flex justify-content-end">
        <Box>
          <div className="flex align-items-center">
            <StyledInput
              pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
              inputMode="decimal"
              min="0"
              value={value}
              onChange={handleOnChange}
              placeholder={placeholder}
              ref={innerRef}
              {...inputProps}
            />
            {unit && <UnitContainer>{unit}</UnitContainer>}
          </div>
          {currencyValue && (
            <Text fontSize="14px" textAlign="right" color="">
              {currencyValue}
            </Text>
          )}
        </Box>
      </div>
    </StyledBalanceInput>
  );
};

export default BalanceInput;