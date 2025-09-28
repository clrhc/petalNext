'use client'; 
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { wagmiAdapter, projectId } from '../config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  metadata: metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
});

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
     
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
     <MiniKitProvider
      apiKey={'ea0c4849-d9fa-4333-9121-64c72395cfb4'}
      chain={base}
    >
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
    </MiniKitProvider>
  )
}

export default ContextProvider