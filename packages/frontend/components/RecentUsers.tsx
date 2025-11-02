'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecentUsers } from '@/hooks/useRecentUsers'
import { Users, ExternalLink } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'

export function RecentUsers() {
  const { recentUsers, isLoading } = useRecentUsers(20)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
          <div className="space-y-3">
            {recentUsers.map((event, index) => (
              <div
                key={`${event.user}-${index}`}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                    <code className="text-sm font-mono text-foreground truncate">
                      {formatAddress(event.user)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(event.user)}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                      title="Copy address"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

