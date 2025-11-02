'use client'

import { useReadContract, useChainId } from 'wagmi'
import { useAccount } from 'wagmi'
import { REFBOOM_ABI, getContractAddress } from '@/lib/contracts'
import { formatUnits } from 'viem'

export function useUserStatus() {
  const { address } = useAccount()
  const chainId = useChainId()
  
  const { data: hasJoined = false } = useReadContract({
    address: getContractAddress(chainId).refBoom,
    abi: REFBOOM_ABI,
    functionName: 'hasJoined',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000, // Poll every 30 seconds to avoid rate limits
    },
  })

  const { data: todayReferrals = 0n } = useReadContract({
    address: getContractAddress(chainId).refBoom,
    abi: REFBOOM_ABI,
    functionName: 'dailyReferrals',
    args: address ? [address, BigInt(Math.floor(Date.now() / 86400000))] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000,
    },
  })

  return {
    address,
    hasJoined,
    todayReferrals: Number(todayReferrals),
  }
}

