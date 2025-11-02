'use client'

import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useAccount, usePublicClient } from 'wagmi'
import { REFBOOM_ABI, USDC_ABI, getContractAddress } from '@/lib/contracts'
import { parseUnits, formatUnits } from 'viem'
import { toast } from 'react-hot-toast'
import { useState, useEffect, useMemo } from 'react'
import { parseContractError } from '@/lib/errorHelpers'

const ENTRY_FEE = parseUnits('100', 6) // 100 USDC (production)
const GENESIS_ENTRY_FEE = parseUnits('75', 6) // 75 USDC (25% discount)

export function useJoinLottery() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const chainId = useChainId()
  const { refBoom, usdc } = getContractAddress(chainId)
  const [referrer, setReferrer] = useState<`0x${string}` | ''>('')

  // Fetch contract constants
  const { data: contractGenesisReferrer } = useReadContract({
    address: refBoom,
    abi: REFBOOM_ABI,
    functionName: 'genesisReferrer',
    query: {
      enabled: !!refBoom,
    },
  })

  const { data: totalUsers = 0n } = useReadContract({
    address: refBoom,
    abi: REFBOOM_ABI,
    functionName: 'totalUsers',
    query: {
      enabled: !!refBoom,
      refetchInterval: 5000,
    },
  })

  // Calculate entry fee based on genesis referrer eligibility
  const entryFee = useMemo(() => {
    if (!referrer || !contractGenesisReferrer) return ENTRY_FEE
    const isGenesisReferrer = referrer.toLowerCase() === contractGenesisReferrer.toLowerCase()
    const isFirst50 = totalUsers < 50n
    return isGenesisReferrer && isFirst50 ? GENESIS_ENTRY_FEE : ENTRY_FEE
  }, [referrer, contractGenesisReferrer, totalUsers])

  // Check USDC allowance
  const { data: allowance = 0n } = useReadContract({
    address: usdc,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, refBoom] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Check USDC balance
  const { data: usdcBalance = 0n } = useReadContract({
    address: usdc,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const needsApproval = allowance < entryFee

  // USDC Approval
  const {
    data: approveHash,
    writeContractAsync: approveAsync,
    writeContract: approve,
    isPending: isApproving,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast.success('Approval sent! Waiting for confirmation...')
      },
      onError: (error) => {
        const friendlyError = parseContractError(error)
        toast.error(friendlyError)
      },
    },
  })

  const { isLoading: isWaitingApproval, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  useEffect(() => {
    if (isApprovalSuccess && approveHash) {
      toast.success('USDC approved! You can now join the lottery.')
    }
  }, [isApprovalSuccess, approveHash])

  // Join Lottery
  const {
    data: joinHash,
    writeContract: join,
    isPending: isJoining,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast.success('Join transaction sent!')
      },
      onError: (error) => {
        const friendlyError = parseContractError(error)
        toast.error(friendlyError)
      },
    },
  })

  const { isLoading: isWaitingJoin, isSuccess: isJoinSuccess } = useWaitForTransactionReceipt({
    hash: joinHash,
  })

  useEffect(() => {
    if (isJoinSuccess && joinHash) {
      toast.success('🎉 Successfully joined the lottery!')
    }
  }, [isJoinSuccess, joinHash])

  const handleApprove = () => {
    approve({
      address: usdc,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [refBoom, entryFee],
    })
  }

  const handleJoin = (userReferrer?: `0x${string}`) => {
    const ref = (userReferrer || referrer) as `0x${string}`
    if (!ref) {
      toast.error('Please provide a valid referrer address')
      return
    }
    
    // Validate referrer format
    if (!/^0x[a-fA-F0-9]{40}$/.test(ref)) {
      toast.error('Invalid address format. Please enter a valid Ethereum address.')
      return
    }
    
    // Check USDC balance
    if (usdcBalance < entryFee) {
      const feeDisplay = formatUnits(entryFee, 6)
      toast.error(`❌ Insufficient USDC balance. You need at least ${feeDisplay} USDC to join.`)
      return
    }
    
    join({
      address: refBoom,
      abi: REFBOOM_ABI,
      functionName: 'join',
      args: [ref],
    })
  }

  const handleApproveAndJoin = async (userReferrer?: `0x${string}`) => {
    const ref = userReferrer || referrer
    if (!ref) {
      toast.error('Please provide a valid referrer address')
      return
    }
    
    if (!publicClient) {
      toast.error('Wallet not connected')
      return
    }
    
    // Validate referrer format
    if (!/^0x[a-fA-F0-9]{40}$/.test(ref)) {
      toast.error('Invalid address format. Please enter a valid Ethereum address.')
      return
    }
    
    // Check USDC balance
    if (usdcBalance < entryFee) {
      const feeDisplay = formatUnits(entryFee, 6)
      toast.error(`❌ Insufficient USDC balance. You need at least ${feeDisplay} USDC to join.`)
      return
    }
    
    try {
      // Step 1: Approve
      toast.loading('Approving USDC...', { id: 'approving' })
      const approveHash = await approveAsync({
        address: usdc,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [refBoom, entryFee],
      })
      
      toast.success('Approval sent! Waiting for confirmation...', { id: 'approving' })
      
      // Step 2: Wait for approval confirmation
      await publicClient.waitForTransactionReceipt({ hash: approveHash })
      
      toast.success('Approval confirmed! Joining lottery now...', { id: 'approving' })
      toast.dismiss('approving')
      
      // Step 3: Join
      join({
        address: refBoom,
        abi: REFBOOM_ABI,
        functionName: 'join',
        args: [ref],
      })
    } catch (error: any) {
      const friendlyError = parseContractError(error)
      toast.error(friendlyError, { id: 'approving' })
    }
  }

  return {
    needsApproval,
    handleApprove,
    handleJoin,
    handleApproveAndJoin,
    isApproving: isApproving || isWaitingApproval,
    isJoining: isJoining || isWaitingJoin,
    setReferrer,
    referrer,
    entryFee,
  }
}
