import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
export const projectId = '3be5abcbf7710426068fb72d159d2227'

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