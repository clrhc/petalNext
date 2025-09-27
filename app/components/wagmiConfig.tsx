import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://base-mainnet.public.blastapi.io', {
      // Lower wait so UI isn’t held up when there are only a few calls
      batch: { wait: 5, batchSize: 50 },
      fetchOptions: { keepalive: true },
      // Optional (supported by viem): short timeout so slow RPCs don’t stall first paint
      // timeout: 10_000,
      // retryCount: 2,
    }),
  },
  ssr: true,
});