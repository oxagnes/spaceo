import { isMobile } from 'react-device-detect';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

export type ProviderTypes = "walletconnect" | null;

interface WalletModalProps {
  visible: boolean;
  onDismiss: () => void;
  doConnect: (provider: ProviderTypes) => void;
}

const WalletModal = ({
  visible,
  onDismiss,
  doConnect
}: WalletModalProps) => {
  return (
    <Dialog
      visible={visible}
      modal
      className="p-fluid"
      header="Connect Wallet"
      style={{ width: '350px' }}
      onHide={onDismiss}
    >
      <div className="flex flex-column">
        {!isMobile ? (
          <div className="flex flex-column mt-2">
            <Button
              className="justify-content-center"
              onClick={() => doConnect(null)}
            >
              MetaMask
            </Button>
            <div className="text-center">Easy-to-use browser extension</div>
          </div>
        ) : (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>&nbsp;</>
        )}
        <div className="flex flex-column mt-2">
          <Button
            className="justify-content-center"
            onClick={() => doConnect('walletconnect')}
          >
            WalletConnect
          </Button>
          <div className="text-center">
            Connect to Trust Wallet, Rainbow Wallet and more...
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default WalletModal;