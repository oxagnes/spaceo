import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

type SerializedBigNumber = string;

export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);
export const BIG_TEN = new BigNumber(10);

export const ethersToSerializedBigNumber = (
  ethersBn: ethers.BigNumber
): SerializedBigNumber => ethersToBigNumber(ethersBn).toJSON();

export const ethersToBigNumber = (ethersBn: ethers.BigNumber): BigNumber =>
  new BigNumber(ethersBn.toString());
