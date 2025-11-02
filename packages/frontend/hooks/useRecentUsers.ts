'use client'

import { useWatchContractEvent, useChainId, usePublicClient } from 'wagmi'
import { useEffect, useState } from 'react'
import { REFBOOM_ABI, getContractAddress, isContractDeployed } from '@/lib/contracts'

interface JoinedEvent {
  user: `0x${string}`
  referrer: `0x${string}`
  timestamp: Date
  address: `0x${string}`
  blockNumber?: bigint
}

export function useRecentUsers(limit: number = 10) {
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const contractAddresses = getContractAddress(chainId)
  const isDeployed = isContractDeployed(contractAddresses.refBoom)
  const [recentUsers, setRecentUsers] = useState<JoinedEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Watch for new Joined events in real-time
  useWatchContractEvent({
    address: contractAddresses.refBoom,
    abi: REFBOOM_ABI,
    eventName: 'Joined',
    enabled: isDeployed && !!publicClient,
    onLogs: (logs) => {
      // Get the latest joined events
      const newEvents: JoinedEvent[] = logs
        .map((log) => {
          const { user, referrer } = log.args
          return {
            user: user || ('0x0000000000000000000000000000000000000000' as `0x${string}`),
            referrer: referrer || ('0x0000000000000000000000000000000000000000' as `0x${string}`),
            timestamp: new Date(),
            address: contractAddresses.refBoom,
            blockNumber: log.blockNumber,
          }
        })
        .filter((e) => e.user !== '0x0000000000000000000000000000000000000000')

      // Add new events to the state, keeping only the most recent ones
      setRecentUsers((prev) => {
        const combined = [...newEvents, ...prev]
        // Remove duplicates based on user address
        const unique = combined.filter(
          (event, index, self) =>
            index === self.findIndex((e) => e.user.toLowerCase() === event.user.toLowerCase())
        )
        return unique.slice(0, limit)
      })
    },
  })

  // Load historical events from the blockchain on mount
  useEffect(() => {
    if (!isDeployed || !publicClient) {
      console.log('[RecentUsers] Skipping load - deployed:', isDeployed, 'client:', !!publicClient)
      setIsLoading(false)
      return
    }

    const loadHistoricalEvents = async () => {
      try {
        console.log('[RecentUsers] Loading historical events from:', contractAddresses.refBoom)
        // Get events from the last 1000 blocks (~4 hours on Base)
        const blockNumber = await publicClient.getBlockNumber()
        const fromBlock = blockNumber > 1000n ? blockNumber - 1000n : 0n
        console.log('[RecentUsers] Querying blocks:', fromBlock, 'to', blockNumber)

        const logs = await publicClient.getLogs({
          address: contractAddresses.refBoom,
          event: {
            type: 'event',
            name: 'Joined',
            inputs: [
              { indexed: true, name: 'user', type: 'address' },
              { indexed: true, name: 'referrer', type: 'address' },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        })

        console.log('[RecentUsers] Found', logs.length, 'Joined events')

        // Transform logs to events with timestamps
        const events: JoinedEvent[] = await Promise.all(
          logs.map(async (log) => {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
            return {
              user: log.args.user as `0x${string}`,
              referrer: log.args.referrer as `0x${string}`,
              timestamp: new Date(Number(block.timestamp) * 1000),
              address: contractAddresses.refBoom,
              blockNumber: log.blockNumber,
            }
          })
        )

        // Sort by block number (descending) and limit
        const sortedEvents = events
          .sort((a, b) => Number((b.blockNumber || 0n) - (a.blockNumber || 0n)))
          .slice(0, limit)

        console.log('[RecentUsers] Setting', sortedEvents.length, 'users')
        setRecentUsers(sortedEvents)
        setIsLoading(false)
      } catch (error) {
        console.error('[RecentUsers] Failed to load historical Joined events:', error)
        setIsLoading(false)
      }
    }

    loadHistoricalEvents()
  }, [chainId, isDeployed, publicClient, contractAddresses.refBoom, limit])

  return {
    recentUsers,
    isLoading,
  }
}

