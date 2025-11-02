'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecentUsers } from '@/hooks/useRecentUsers'
import { Users, ExternalLink, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useChainId } from 'wagmi'

export function RecentUsers() {
  const { recentUsers, isLoading } = useRecentUsers(20)
  const chainId = useChainId()
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle>Recent Participants</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <CardTitle>Recent Participants</CardTitle>
        </div>
        <CardDescription>Latest users who joined the lottery</CardDescription>
      </CardHeader>
      <CardContent>
        {recentUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No participants yet</p>
            <p className="text-xs">Be the first to join!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentUsers.map((event, index) => (
              <div
                key={`${event.user}-${index}`}
                className="border border-border/50 rounded-lg overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => setExpandedUser(expandedUser === event.user ? null : event.user)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                      <code className="text-sm font-mono text-foreground truncate">
                        {formatAddress(event.user)}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(getExplorerUrl(undefined, event.user), '_blank')
                      }}
                      className="opacity-50 hover:opacity-100 transition-opacity p-1"
                      title="View on BaseScan"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(event.user)
                      }}
                      className="opacity-50 hover:opacity-100 transition-opacity p-1"
                      title="Copy address"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {expandedUser === event.user ? (
                      <ChevronUp className="h-4 w-4 opacity-50" />
                    ) : (
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    )}
                  </div>
                </div>
                {expandedUser === event.user && (
                  <div className="p-3 bg-background border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">
                      Referred by: <code className="font-mono">{formatAddress(event.referrer)}</code>
                    </p>
                    <button
                      onClick={() => window.open(getExplorerUrl(undefined, event.referrer), '_blank')}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View referrer on BaseScan
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

