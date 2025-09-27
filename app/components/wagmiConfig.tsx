import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';

// Create the Wagmi config
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://base-mainnet.infura.io/v3/cc877a2fcbd848a89360422e704227d3'), // public RPC or your Alchemy/Infura key
  },
  ssr: true, // ✅ if you're using SSR in Next.js
});