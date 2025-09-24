'use client';
import type { ReactNode } from 'react'; 
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { sepolia } from '@reown/appkit/networks';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Reown Cloud projectId
const projectId = '0836dedc1a04038f19bcfd52356a9258';

const metadata = {
  name: 'Petal Finance',
  description: 'Petal Finance',
  url: 'https://petal.wtf',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// 3. Set the networks (as a non-empty tuple)
const networks = [sepolia] as [typeof baseSepolia]; 

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
      apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY} 
      chain={base}
    >
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </MiniKitProvider>
  );
}