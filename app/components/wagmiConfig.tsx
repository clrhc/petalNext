import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://base-mainnet.public.blastapi.io', {
      // Batch any RPC calls fired within this window into a single request
      batch: { wait: 25, batchSize: 20 },

      // Nice-to-haves:
      fetchOptions: { keepalive: true }, // keep TCP warm for bursts
    }),
  },
  ssr: true,
});