import { HelmetProvider } from 'react-helmet-async';
import { MoralisProvider } from 'react-moralis';
import { Provider } from 'react-redux';

import { Contexts } from '@dehub/react/core';

import { getChainId } from './config/constants';
import { RefreshContextProvider } from './contexts/RefreshContext';
import { store } from './states';
import Lottery from './views/Lottery';
import { environment } from '../environments/environment';

const { appId, serverUrl } = environment.moralis;

export function App() {
  return (
    <MoralisProvider appId={appId} serverUrl={serverUrl}>
      <Provider store={store}>
        <Contexts.MoralisEthersProvider>
          <RefreshContextProvider>
            <HelmetProvider>
              <Lottery />
            </HelmetProvider>
          </RefreshContextProvider>
        </Contexts.MoralisEthersProvider>
      </Provider>
    </MoralisProvider>
  );
}

export default App;
