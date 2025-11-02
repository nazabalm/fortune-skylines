'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccount, useChainId } from 'wagmi'
import { useReadContract } from 'wagmi'
import { REFBOOM_ABI, getContractAddress } from '@/lib/contracts'
import { Users, TrendingUp, ExternalLink } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'

interface ReferralInfo {
  user: string
  transactionHash: string
}

export function MyReferrals() {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const contractAddresses = getContractAddress(chainId)
  const [myReferrals, setMyReferrals] = useState<ReferralInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get today's referral count
  const today = Math.floor(Date.now() / 86400000)
  const { data: todayReferrals = 0n } = useReadContract({
    address: contractAddresses.refBoom,
    abi: REFBOOM_ABI,
    functionName: 'dailyReferrals',
    args: address ? [address, BigInt(today)] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  })

  // Fetch all users I referred
  useEffect(() => {
    if (!address || !publicClient) {
      setMyReferrals([])
      setIsLoading(false)
      return
    }

    const loadMyReferrals = async () => {
      setIsLoading(true)
      try {
        const blockNumber = await publicClient.getBlockNumber()
        const fromBlock = blockNumber > 50000n ? blockNumber - 50000n : 0n

        const joinedEventAbi = parseAbiItem('event Joined(address indexed user, address indexed referrer)')
        
        const logs = await publicClient.getLogs({
          address: contractAddresses.refBoom,
          event: joinedEventAbi,
          fromBlock,
          toBlock: 'latest',
          args: {
            referrer: address,  // Filter by my address as referrer
          },
        })

        const referredUsers: ReferralInfo[] = logs
          .map(log => ({
            user: log.args.user as string,
            transactionHash: log.transactionHash,
          }))
          .filter(info => info.user !== '0x0000000000000000000000000000000000000000')

        setMyReferrals(referredUsers)
      } catch (error) {
        console.error('[MyReferrals] Failed to load referrals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMyReferrals()
  }, [address, publicClient, contractAddresses.refBoom])

  const getExplorerUrl = (txHash?: string, address?: string) => {
    const explorerBase = chainId === 8453 
      ? 'https://basescan.org' 
      : 'https://sepolia.basescan.org'
    
    if (txHash) {
      return `${explorerBase}/tx/${txHash}`
    }
    if (address) {
      return `${explorerBase}/address/${address}`
    }
    return explorerBase
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle>My Referrals</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Connect wallet to see your referrals</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <CardTitle>My Referrals</CardTitle>
        </div>
        <CardDescription>
          {Number(todayReferrals)} referrals today (max 20)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : myReferrals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No referrals yet</p>
            <p className="text-xs">Share your link to start earning!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myReferrals.map((referral, index) => (
              <div
                key={referral.user}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-6">#{index + 1}</span>
                  <code className="text-sm font-mono text-foreground">{formatAddress(referral.user)}</code>
                </div>
                <button
                  onClick={() => window.open(getExplorerUrl(referral.transactionHash), '_blank')}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                  title="View transaction on BaseScan"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

