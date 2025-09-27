import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'

// Wagmi config with HTTP batching
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://base-mainnet.public.blastapi.io', {
      // Batch any RPC calls fired within this window into a single request
      batch: { wait: 25, maxSize: 20 },

      // Nice-to-haves:
      fetchOptions: { keepalive: true }, // keep TCP warm for bursts
      retryCount: 2,                      // fewer blind retries
      timeout: 20_000,                    // avoid long hangs
    }),
  },
  // Optional: if you render on the server
  ssr: true,
});