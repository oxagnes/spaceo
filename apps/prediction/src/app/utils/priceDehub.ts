import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber';
import { ContractAddresses } from '@dehub/shared/config';
import { ethersToBigNumber } from '@dehub/shared/utils';

import PancakePairAbi from '../config/abi/PancakePair.json';
import { getChainId } from '../config/constants';
import { getContract } from './contractHelpers';

const getPancakeLiquidityInfo = async (quote: string, base: string) => {
  const quoteToken = ContractAddresses[getChainId()][quote];

  const pairAddress = ContractAddresses[getChainId()][`${quote}-${base}`];
  const pairContract = getContract(pairAddress, PancakePairAbi);

  const reserves = await pairContract.getReserves();
  const token0 = await pairContract.token0();

  if (token0.toLowerCase() === quoteToken.toLowerCase()) {
    return {
      quoteToken: {
        reserve: reserves[0],
      },
      baseToken: {
        reserve: reserves[1],
      },
    };
  } else {
    return {
      quoteToken: {
        reserve: reserves[1],
      },
      baseToken: {
        reserve: reserves[0],
      },
    };
  }
};

export const getBNBPrice = async (): Promise<BigNumber> => {
  const bnbBusdLp = await getPancakeLiquidityInfo('BNB', 'BUSD');
  return ethersToBigNumber(
    bnbBusdLp.baseToken.reserve.div(bnbBusdLp.quoteToken.reserve)
  );
};

export const getDehubPrice = async (): Promise<BigNumber> => {
  const tokenBnbLp = await getPancakeLiquidityInfo('DeHub', 'BNB');

  const dehubPrice = await getBNBPrice();
  const bnbPriceAsEth = EthersBigNumber.from(dehubPrice.toString());
  return ethersToBigNumber(
    tokenBnbLp.baseToken.reserve
      .mul(bnbPriceAsEth)
      .div(tokenBnbLp.quoteToken.reserve)
  );
};

export default getDehubPrice;
