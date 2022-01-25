import { Signer } from '@ethersproject/abstract-signer';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import Bep20Abi from '../config/abis/erc20.json';
import MulticallAbi from '../config/abis/Multicall.json';
import RewardsAbi from '../config/abis/Reward.json';
import StakingAbi from '../config/abis/Staking.json';
import {
  getMultiCallAddress,
  getRewardsAddress,
  getStakingAddress,
} from './addressHelpers';
import { simpleRpcProvider } from './providers';

export const getContract = (
  address: string,
  abi: ContractInterface,
  signer?: Signer | Provider
) => {
  const signerOrProvider = signer ?? simpleRpcProvider;
  return new Contract(address, abi, signerOrProvider);
};

export const getMultiCallContract = (signer?: Signer | Provider) => {
  return getContract(getMultiCallAddress(), MulticallAbi, signer);
};

export const getBep20Contract = (
  address: string,
  signer?: Signer | Provider
) => {
  return getContract(address, Bep20Abi, signer);
};

export const getStakingContract = (signer?: Signer | Provider) => {
  return getContract(getStakingAddress(), StakingAbi, signer);
};

export const getRewardsContract = (signer?: Signer | Provider) => {
  return getContract(getRewardsAddress(), RewardsAbi, signer);
};
