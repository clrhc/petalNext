'use client';

import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors'; // ⬅️ removed walletConnect
import { base } from '@reown/appkit/networks';
import type { CreateConnectorFn } from 'wagmi';

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
];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
  connectors,
});

export const config = wagmiAdapter.wagmiConfig;