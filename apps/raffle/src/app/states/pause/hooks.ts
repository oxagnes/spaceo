import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Hooks } from '@dehub/react/core';

import { fetchCurrentStandardPaused, fetchCurrentSpecialPaused } from '.';
import { useAppDispatch } from '..';
import { State } from '../types';

export const useFetchPaused = () => {
  const { slowRefresh } = Hooks.useRefresh();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCurrentStandardPaused());
    dispatch(fetchCurrentSpecialPaused());
  }, [dispatch, slowRefresh]);
};

export const useGetStandardPaused = (): boolean => {
  return useSelector((state: State) => state.paused.standardPaused);
};

export const useGetSpecialPaused = (): boolean => {
  return useSelector((state: State) => state.paused.specialPaused);
};
