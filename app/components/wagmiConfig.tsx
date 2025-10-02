import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: {
    [base.id]: http('https://base-mainnet.public.blastapi.io'), // public RPC or your Alchemy/Infura key
  },
  ssr: true,
});