'use client'

import { usePublicClient, useChainId } from 'wagmi'
import { useEffect, useState } from 'react'
import { REFBOOM_ABI, getContractAddress, isContractDeployed } from '@/lib/contracts'
import { parseEventLogs, type Address } from 'viem'

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
    if (!publicClient || !isDeployed) {
      setIsLoading(false)
      return
    }

    const fetchWinnerEvent = async () => {
      try {
        // Get the most recent WinnerSelected event
        const logs = await publicClient.getLogs({
          address: contractAddresses.refBoom,
          event: {
            type: 'event',
            name: 'WinnerSelected',
            inputs: [
              { indexed: true, name: 'winner', type: 'address' },
              { indexed: false, name: 'amount', type: 'uint256' },
            ],
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        })

        if (logs && logs.length > 0) {
          // Get the most recent event
          const latestLog = logs[logs.length - 1]
          
          // Get transaction receipt to find the transaction hash
          const receipt = await publicClient.getTransactionReceipt({
            hash: latestLog.transactionHash,
          })

          if (receipt) {
            setWinnerEvent({
              winner: latestLog.args.winner as Address,
              amount: latestLog.args.amount as bigint,
              transactionHash: receipt.transactionHash,
              blockNumber: receipt.blockNumber,
            })
          }
        }
      } catch (error) {
        console.error('Error fetching winner event:', error)
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

