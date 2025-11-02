'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useContractData } from '@/hooks/useContractData'
import { REFBOOM_ABI, getContractAddress, isContractDeployed } from '@/lib/contracts'
import { Shield, Crown, Users, Coins, CheckCircle2, XCircle, Loader2, Settings } from 'lucide-react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { toast } from 'react-hot-toast'
import { formatUnits } from 'viem'

function AdminContent() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const contractAddresses = getContractAddress(chainId)
  const isDeployed = isContractDeployed(contractAddresses.refBoom)
  
  // Read contract owner - this is the REAL admin
  const { data: owner } = useReadContract({
    address: contractAddresses.refBoom,
    abi: REFBOOM_ABI,
    functionName: 'owner',
    query: {
      enabled: isDeployed && isConnected,
    },
  })
  
  // Check if current user is admin (owner of the contract)
  const isAdmin = owner && address?.toLowerCase() === owner.toLowerCase()
  
  // Contract state
  const { prizePool, totalUsers, winnerSelected, winner, prizeAmount } = useContractData()
  
  const { data: sorteoTriggered } = useReadContract({
    address: contractAddresses.refBoom,
    abi: REFBOOM_ABI,
    functionName: 'sorteoTriggered',
    query: {
      enabled: isDeployed && isConnected,
    },
  })
  
  const { data: requestId } = useReadContract({
    address: contractAddresses.refBoom,
    abi: REFBOOM_ABI,
    functionName: 'requestId',
    query: {
      enabled: isDeployed && isConnected,
    },
  })

  // Select Winner action
  const { data: selectWinnerHash, writeContract: selectWinnerWrite, isPending: isSelecting } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast.success('Winner selection transaction sent!')
      },
      onError: (error) => {
        toast.error(`Failed to select winner: ${error.message}`)
      },
    },
  })

  const { isLoading: isWaitingSelection, isSuccess: isSelectionSuccess } = useWaitForTransactionReceipt({
    hash: selectWinnerHash,
  })

  useEffect(() => {
    if (isSelectionSuccess) {
      toast.success('🎉 Winner selection triggered! Waiting for VRF to complete...')
    }
  }, [isSelectionSuccess])

  // Complete Winner Payment action
  const { data: completePaymentHash, writeContract: completePaymentWrite, isPending: isCompleting } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast.success('Payment completion transaction sent!')
      },
      onError: (error) => {
        toast.error(`Failed to complete payment: ${error.message}`)
      },
    },
  })

  const { isLoading: isWaitingPayment, isSuccess: isPaymentSuccess } = useWaitForTransactionReceipt({
    hash: completePaymentHash,
  })

  useEffect(() => {
    if (isPaymentSuccess) {
      toast.success('✅ Winner payment completed!')
    }
  }, [isPaymentSuccess])

  const handleSelectWinner = () => {
    selectWinnerWrite({
      address: contractAddresses.refBoom,
      abi: REFBOOM_ABI,
      functionName: 'selectWinner',
    })
  }

  const handleCompletePayment = () => {
    completePaymentWrite({
      address: contractAddresses.refBoom,
      abi: REFBOOM_ABI,
      functionName: 'completeWinnerPayment',
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <main className="container mx-auto px-4 py-16 max-w-4xl">
          <Card className="border-red-500/20 bg-red-950/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-400">🔒 Admin Access Required</CardTitle>
              <CardDescription className="text-red-300">
                Please connect your wallet to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConnectButton />
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <main className="container mx-auto px-4 py-16 max-w-4xl">
          <Card className="border-red-500/20 bg-red-950/10 backdrop-blur-sm">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-400 mb-4" />
              <CardTitle className="text-red-400">🚫 Access Denied</CardTitle>
              <CardDescription className="text-red-300">
                This page is restricted to admin only
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Connected wallet:</p>
                <code className="text-xs text-foreground break-all">{address}</code>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Contract Owner (Admin):</p>
                <code className="text-xs text-foreground break-all">{owner || 'Loading...'}</code>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const isLoading = isSelecting || isWaitingSelection || isCompleting || isWaitingPayment

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-yellow-400" />
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent whitespace-nowrap">
                Admin Panel
              </h1>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                Restricted
              </Badge>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!isDeployed && (
          <Card className="border-yellow-500/20 bg-yellow-950/10 backdrop-blur-sm mb-6">
            <CardContent className="pt-6">
              <p className="text-yellow-400 text-sm">⚠️ Contract not deployed or invalid address</p>
            </CardContent>
          </Card>
        )}

        {/* Admin Info Card */}
        <Card className="border-indigo-500/20 bg-gradient-to-br from-slate-900/50 to-indigo-950/30 backdrop-blur-sm shadow-2xl shadow-indigo-500/10 mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-indigo-400" />
              <CardTitle className="text-2xl font-bold">Admin Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Contract Owner:</span>
              <code className="text-xs bg-slate-900/50 px-2 py-1 rounded">
                {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : <Skeleton className="h-4 w-32" />}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Address:</span>
              <code className="text-xs bg-slate-900/50 px-2 py-1 rounded">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Admin Status:</span>
              <Badge className={isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                {isAdmin ? 'Authorized' : 'Unauthorized'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chain:</span>
              <Badge>
                {chainId === 84532 ? 'Base Sepolia' : chainId === 8453 ? 'Base Mainnet' : `Chain ${chainId}`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Contract Status Card */}
        <Card className="border-indigo-500/20 bg-gradient-to-br from-slate-900/50 to-indigo-950/30 backdrop-blur-sm shadow-2xl shadow-indigo-500/10 mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              <CardTitle className="text-2xl font-bold">Lottery Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Participants</span>
                </div>
                <div className="text-2xl font-bold">{totalUsers}</div>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Prize Pool</span>
                </div>
                <div className="text-2xl font-bold">${Number(prizePool).toFixed(2)}</div>
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm">Winner Selected:</span>
                {winnerSelected ? (
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500/20 text-gray-400">
                    <XCircle className="h-3 w-3 mr-1" />
                    No
                  </Badge>
                )}
              </div>
              {winnerSelected && winner && (
                <div className="p-3 bg-green-950/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Winner Address:</p>
                  <code className="text-sm text-green-400 break-all">{winner}</code>
                  {prizeAmount && (
                    <p className="text-xs text-green-400 mt-2">
                      Prize: ${prizeAmount} USDC
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm">VRF Triggered:</span>
                {sorteoTriggered ? (
                  <Badge className="bg-blue-500/20 text-blue-400">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500/20 text-gray-400">
                    <XCircle className="h-3 w-3 mr-1" />
                    No
                  </Badge>
                )}
              </div>
              
              {requestId && (
                <div className="p-3 bg-blue-950/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">VRF Request ID:</p>
                  <code className="text-sm text-blue-400 break-all">{requestId.toString()}</code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="border-indigo-500/20 bg-gradient-to-br from-slate-900/50 to-indigo-950/30 backdrop-blur-sm shadow-2xl shadow-indigo-500/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              <CardTitle className="text-2xl font-bold">Admin Actions</CardTitle>
            </div>
            <CardDescription>
              Manage the lottery and trigger winner selection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Select Winner Button */}
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h4 className="font-semibold mb-2">Trigger Winner Selection</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Request random winner selection from Chainlink VRF. This can only be done once.
              </p>
              <Button
                onClick={handleSelectWinner}
                disabled={isLoading || !!winnerSelected || !!sorteoTriggered || totalUsers === 0}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : winnerSelected ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Winner Already Selected
                  </>
                ) : sorteoTriggered ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    VRF Already Triggered
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Select Winner
                  </>
                )}
              </Button>
            </div>

            {/* Complete Payment Button */}
            {(winnerSelected && prizeAmount) && (
              <div className="p-4 bg-yellow-950/20 rounded-lg border border-yellow-500/20">
                <h4 className="font-semibold mb-2 text-yellow-400">Complete Winner Payment</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Manually complete the winner payment if the automatic transfer failed.
                </p>
                <Button
                  onClick={handleCompletePayment}
                  disabled={isLoading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Coins className="mr-2 h-4 w-4" />
                      Complete Payment
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function AdminPage() {
  return <AdminContent />
}

