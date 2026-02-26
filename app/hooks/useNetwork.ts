'use client';

import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';

export function useNetwork() {
  const { address, isConnected, caipAddress } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();

  const isSolana = isConnected && caipNetwork?.chainNamespace === 'solana';
  const isEvm = isConnected && caipNetwork?.chainNamespace === 'eip155';

  return {
    isConnected,
    address,
    caipAddress,
    caipNetwork,
    isSolana,
    isEvm,
  };
}
