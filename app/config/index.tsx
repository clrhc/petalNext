import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
export const projectId = '02c1dfefe151daa8e46ba390d135aa6e'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [base]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig