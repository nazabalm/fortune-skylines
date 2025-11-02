import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'FortuneSkylines Lottery',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default',
  chains: [baseSepolia, base], // Base Sepolia first for default chain behavior
  ssr: true,
})

