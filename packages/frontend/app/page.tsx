'use client'

import { Suspense } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useContractData } from '@/hooks/useContractData'
import { useUserStatus } from '@/hooks/useUserStatus'
import { useJoinLottery } from '@/hooks/useJoinLottery'
import { Trophy, Users, TrendingUp, Gift, Copy, CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { formatEther } from 'viem'
import { WinnerAnnouncement } from '@/components/WinnerAnnouncement'
import { useChainId } from 'wagmi'

function AnimatedCounter({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = value / steps
    let current = 0
    let step = 0
    
    const timer = setInterval(() => {
      step++
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value])
  
  return <span>{displayValue.toFixed(decimals)}</span>
}

function PrizePoolDisplay() {
  const { prizePool, progress, totalUsers } = useContractData()
  
  return (
    <Card className="border-2 border-gradient bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <CardTitle className="text-3xl font-bold">Prize Pool</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          $<AnimatedCounter value={Number(prizePool)} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Progress to Winner Selection</span>
            <span className="text-purple-600">{totalUsers} / 1000</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function JoinForm() {
  const { address, hasJoined } = useUserStatus()
  const { needsApproval, handleApprove, handleJoin, handleApproveAndJoin, isApproving, isJoining, setReferrer, referrer } = useJoinLottery()
  const searchParams = useSearchParams()
  const [ownerReferrer, setOwnerReferrer] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && ref.startsWith('0x')) {
      setReferrer(ref as `0x${string}`)
    }
  }, [searchParams, setReferrer])

  // Fetch owner address for first user
  useEffect(() => {
    // You'll need to get this from contract when ready
    // For now, placeholder
    setOwnerReferrer('0x')
  }, [])

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join the Lottery</CardTitle>
          <CardDescription>Connect your wallet to participate</CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectButton />
        </CardContent>
      </Card>
    )
  }

  if (hasJoined) {
    const referralLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${address}` : ''

    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-800 dark:text-green-200">You're In!</CardTitle>
          </div>
          <CardDescription className="text-green-700 dark:text-green-300">
            You've successfully joined the lottery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Referral Link</label>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-xs" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(referralLink)
                  setCopied(true)
                  toast.success('Link copied!')
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const loading = isApproving || isJoining

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join the Lottery</CardTitle>
        <CardDescription>Enter with 0.001 USDC and start earning rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Referrer Address (Required)
          </label>
          <Input
            placeholder="0x..."
            value={referrer}
            onChange={(e) => setReferrer(e.target.value as `0x${string}`)}
            disabled={loading}
          />
          {!referrer && (
            <p className="text-xs text-muted-foreground mt-1">
              Enter the wallet address of the person who referred you
            </p>
          )}
        </div>
        {needsApproval ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <strong>Note:</strong> You need to approve the 0.001 USDC entry fee. This is required before joining.
            </p>
            <Button 
              onClick={() => handleApproveAndJoin()} 
              disabled={loading || !referrer}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Approve & Join (0.001 USDC)
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => handleJoin()}
            disabled={loading || !referrer}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Join Lottery (0.001 USDC)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function StatsGrid() {
  const { address, todayReferrals } = useUserStatus()
  const { totalUsers } = useContractData()
  
  const stats = [
    {
      title: 'Total Participants',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'Your Referrals Today',
      value: todayReferrals,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className={stat.bgColor}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="text-3xl font-bold mt-2">
                    {address ? stat.value : <Skeleton className="h-8 w-16" />}
                  </div>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function HowItWorks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How It Works</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold">Enter the Lottery</h4>
              <p className="text-sm text-muted-foreground">Pay 0.001 USDC to join</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold">Refer Friends</h4>
              <p className="text-sm text-muted-foreground">
                Get 0.0005 USDC per successful referral (max 20/day)
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold">Win Big</h4>
              <p className="text-sm text-muted-foreground">
                When we hit 1000 participants, a winner is selected at random from the prize pool
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Prize Distribution:</p>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>🎯 0.0004 USDC → Prize Pool</div>
            <div>💸 0.0005 USDC → Referrer (You!)</div>
            <div>🔧 0.0001 USDC → Platform Fee</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LotteryContent() {
  const chainId = useChainId()
  const supportedChains = [84532, 8453] // Base Sepolia, Base Mainnet
  const isSupportedChain = supportedChains.includes(chainId)

  if (!isSupportedChain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950 dark:via-black dark:to-blue-950 flex items-center justify-center">
        <Card className="max-w-md border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">⚠️ Unsupported Network</CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              Please switch to Base or Base Sepolia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              RefBoom is currently only available on Base networks. Please switch your wallet to:
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-2">
              <li>• Base Sepolia (Testnet)</li>
              <li>• Base (Mainnet)</li>
            </ul>
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950 dark:via-black dark:to-blue-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              RefBoom
            </h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <WinnerAnnouncement />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <PrizePoolDisplay />
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <JoinForm />
            </Suspense>
            <HowItWorks />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <StatsGrid />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return <LotteryContent />
}
