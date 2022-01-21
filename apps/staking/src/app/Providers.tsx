import { Contexts } from '@dehub/react/core';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import store from './state';

const Providers: React.FC = ({ children }) => {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <Contexts.RefreshContextProvider>
          {children}
        </Contexts.RefreshContextProvider>
      </HelmetProvider>
    </Provider>
  );
};

export default Providers;
