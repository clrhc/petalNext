import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';

// Create the Wagmi config
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://base-mainnet.public.blastapi.io'), // public RPC or your Alchemy/Infura key
  },
  ssr: true, // ✅ if you're using SSR in Next.js
});