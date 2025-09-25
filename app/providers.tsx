'use client';
import type { ReactNode } from 'react'; 
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { base } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Reown Cloud projectId
const projectId = '02c1dfefe151daa8e46ba390d135aa6e';

const metadata = {
  name: 'Petal Finance',
  description: 'Petal Finance',
  url: 'https://petal.wtf',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// 3. Set the networks (as a non-empty tuple)
const networks = [base] as [typeof base]; 

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,     
  projectId,
  ssr: true,
});

// 5. Create AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,  
  projectId,
  metadata,
  features: {
    analytics: true,
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
     <MiniKitProvider
      apiKey={'ea0c4849-d9fa-4333-9121-64c72395cfb4'}
      chain={base}
    >
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
      </MiniKitProvider>
  );
}