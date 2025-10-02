'use client';
import { wagmiAdapter, projectId } from '../config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { createAppKit } from '@reown/appkit/react';
import { base } from '@reown/appkit/networks';
import React, { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

const queryClient = new QueryClient();

const metadata = {
  name: 'Petal Finance',
  description: 'Petal Finance',
  url: 'https://www.petal.wtf',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base],
  defaultNetwork: base,
  metadata,
  features: { analytics: true },
  featuredWalletIds: [
    // Coinbase
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    // Farcaster
    '99a71c7a80284d5c59f5f39562fda701c1b60e6d60a8167db88c8af2cf453fd0',
  ],
});

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <OnchainKitProvider
      apiKey={process.env.ONCHAINKIT_API_KEY}
      chain={base}
      config={{
      appearance: { mode: 'auto' },
      wallet: {
      display: 'classic',
     },
    }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
    >
      <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </OnchainKitProvider>
  );
}

export default ContextProvider;