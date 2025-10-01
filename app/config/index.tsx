// config.ts
'use client';

import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { base } from '@reown/appkit/networks';
import type { CreateConnectorFn } from 'wagmi';

// Your existing projectId
export const projectId = '3be5abcbf7710426068fb72d159d2227';
if (!projectId) throw new Error('Project ID is not defined');

export const networks = [base];


const connectors: CreateConnectorFn[] = [
  coinbaseWallet({
    appName: 'Petal Finance',
    preference: 'all',
    enableMobileWalletLink: true,
  }),
  injected({ shimDisconnect: true }),
  walletConnect({ projectId }),
];

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
  connectors,
});

// Export wagmi config if you need it directly
export const config = wagmiAdapter.wagmiConfig;