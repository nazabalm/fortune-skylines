'use client'

import { usePublicClient, useChainId } from 'wagmi'
import { useEffect, useState } from 'react'
import { REFBOOM_ABI, getContractAddress, isContractDeployed } from '@/lib/contracts'
import { parseAbiItem, type Address } from 'viem'

interface WinnerEvent {
  winner: Address
  amount: bigint
  transactionHash: `0x${string}`
  blockNumber: bigint
}

export function useWinnerEvent() {
  const publicClient = usePublicClient()
  let chainId = useChainId()
  // Default to Base Sepolia if chain ID is unsupported or 0
  if (!chainId || chainId === 0 || ![84532, 8453].includes(chainId)) {
    chainId = 84532 // Base Sepolia
  }
  const contractAddresses = getContractAddress(chainId)
  const isDeployed = isContractDeployed(contractAddresses.refBoom)
  const [winnerEvent, setWinnerEvent] = useState<WinnerEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[useWinnerEvent] Effect triggered:', { publicClient: !!publicClient, isDeployed, contract: contractAddresses.refBoom })
    
    if (!publicClient || !isDeployed) {
      setIsLoading(false)
      return
    }

    const fetchWinnerEvent = async () => {
      try {
        console.log('[useWinnerEvent] Fetching logs from:', contractAddresses.refBoom)
        
        // Get the most recent WinnerSelected event using the ABI
        // Fetch from last 100k blocks to avoid range limit
        const latestBlock = await publicClient.getBlockNumber()
        const fromBlock = latestBlock > 100000n ? latestBlock - 100000n : 0n
        
        const logs = await publicClient.getLogs({
          address: contractAddresses.refBoom,
          event: parseAbiItem('event WinnerSelected(address indexed winner, uint256 amount)'),
          fromBlock,
          toBlock: 'latest',
        })

        console.log('[useWinnerEvent] Found logs:', logs.length)
        console.log('[useWinnerEvent] All logs:', logs)

        if (logs && logs.length > 0) {
          // Get the most recent event
          const latestLog = logs[logs.length - 1]
          
          console.log('[useWinnerEvent] Latest log:', latestLog)
          
          // The transaction hash is already in the log
          if (latestLog.transactionHash && latestLog.args.winner) {
            setWinnerEvent({
              winner: latestLog.args.winner as Address,
              amount: latestLog.args.amount as bigint,
              transactionHash: latestLog.transactionHash,
              blockNumber: latestLog.blockNumber,
            })
            console.log('[useWinnerEvent] Set winner event with tx:', latestLog.transactionHash)
          } else {
            console.warn('[useWinnerEvent] Latest log missing required fields:', {
              hasTxHash: !!latestLog.transactionHash,
              hasWinner: !!latestLog.args.winner,
              log: latestLog
            })
          }
        }
      } catch (error) {
        console.error('[useWinnerEvent] Error fetching winner event:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWinnerEvent()

    // Poll for new events every 5 seconds
    const interval = setInterval(fetchWinnerEvent, 5000)

    return () => clearInterval(interval)
  }, [publicClient, contractAddresses.refBoom, isDeployed, chainId])

  return {
    winnerEvent,
    isLoading,
  }
}

