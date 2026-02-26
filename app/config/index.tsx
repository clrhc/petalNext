'use client';

import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { base, solana } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import type { CreateConnectorFn } from 'wagmi';

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID as string;
if (!projectId) throw new Error('Project ID is not defined');

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [base, solana];

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
  networks: [base],
  connectors,
});

export const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

export const config = wagmiAdapter.wagmiConfig;
