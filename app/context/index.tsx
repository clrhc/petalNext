'use client'; 
import { wagmiAdapter, projectId } from '../config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { createAppKit } from '@reown/appkit/react';
import { base } from '@reown/appkit/networks';
import React, { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
};

const metadata = {
  name: 'Petal Finance',
  description: 'Petal Finance',
  url: 'https://www.petal.wtf',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// Create the modal
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
    '99a71c7a80284d5c59f5f39562fda701c1b60e6d60a8167db88c8af2cf453fd0'
  ]
});

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
     
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <MiniKitProvider apiKey={'L9RknrEp7oeLfKo8ZPBTEdYFiOMiqjHm'} chain={base}>
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
    </MiniKitProvider>
  )
}

export default ContextProvider