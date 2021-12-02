import { StrictMode } from 'react';
import { MoralisProvider } from 'react-moralis';
import { Constants } from '@dehub/shared/config';
import { Contexts } from '@dehub/react/core';
import { ModalProvider } from '@dehub/react/pcsuikit';
import Providers from './app/Providers';
import { getChainId } from './app/config/constants';

import * as ReactDOM from 'react-dom';

import App from './app/app';

const appId = Constants[getChainId()].MORALIS_ID;
const serverUrl = Constants[getChainId()].MORALIS_SERVER;

ReactDOM.render(
  <StrictMode>
    <MoralisProvider appId={appId} serverUrl={serverUrl}>
      <Providers>
        <Contexts.MoralisEthersProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </Contexts.MoralisEthersProvider>
      </Providers>
    </MoralisProvider>
  </StrictMode>,
  document.getElementById('root')
);
