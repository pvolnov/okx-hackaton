/// <reference types="vite/client" />

declare const __APP_VERSION__: string

import { MetaMaskInpageProvider } from '@metamask/providers'

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}
