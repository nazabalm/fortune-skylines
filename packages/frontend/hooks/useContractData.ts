'use client'

import { useReadContract, useBlockNumber, useChainId } from 'wagmi'
import { REFBOOM_ABI, getContractAddress, isContractDeployed } from '@/lib/contracts'
import { formatUnits } from 'viem'

export function useContractData() {
  const { data: blockNumber } = useBlockNumber({ watch: true })
  let chainId = useChainId()
  // Default to Base Sepolia if chain ID is unsupported or 0
  if (!chainId || chainId === 0 || ![84532, 8453].includes(chainId)) {
    chainId = 84532 // Base Sepolia
  }
  const contractAddresses = getContractAddress(chainId)
  const isDeployed = isContractDeployed(contractAddresses.refBoom)
  
  const { data: prizePool = 0n } = useReadContract({
    address: contractAddresses.refBoom,
    abi: REFBOOM_ABI,
    functionName: 'getPrizePool',
    query: {
      refetchInterval: 5000, // Poll every 5 seconds
      enabled: isDeployed,
    },
  })

  const { data: totalUsers = 0n } = useReadContract({
    address: contractAddresses.refBoom,
    abi: REFBOOM_ABI,
    functionName: 'totalUsers',
    query: {
      refetchInterval: 5000,
      enabled: isDeployed,
    },
  })

  const { data: winnerSelected = false } = useReadContract({
    address: contractAddresses.refBoom,
    abi: REFBOOM_ABI,
    functionName: 'winnerSelected',
    query: {
      refetchInterval: 5000,
      enabled: isDeployed,
    },
  })

  const { data: winner = '0x0000000000000000000000000000000000000000' as `0x${string}` } = useReadContract({
    address: contractAddresses.refBoom,
    abi: REFBOOM_ABI,
    functionName: 'winner',
    query: {
      refetchInterval: 5000,
      enabled: winnerSelected && isDeployed,
    },
  })

  const { data: prizeAmount = 0n } = useReadContract({
    address: contractAddresses.refBoom,
    abi: REFBOOM_ABI,
    functionName: 'prizeAmount',
    query: {
      refetchInterval: 5000,
      enabled: winnerSelected && isDeployed,
    },
  })

  const progress = totalUsers > 1000n ? 100 : (Number(totalUsers) / 1000) * 100

  return {
    prizePool: formatUnits(prizePool, 6), // USDC has 6 decimals
    totalUsers: Number(totalUsers),
    winnerSelected,
    winner,
    prizeAmount: formatUnits(prizeAmount, 6),
    progress,
    blockNumber,
  }
}

