'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, PartyPopper } from 'lucide-react'
import { useContractData } from '@/hooks/useContractData'

export function WinnerAnnouncement() {
  const { winnerSelected, winner, prizeAmount } = useContractData()
  const [hasPlayed, setHasPlayed] = useState(false)

  useEffect(() => {
    if (winnerSelected && winner && !hasPlayed) {
      // Play confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      // More confetti after delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        })
      }, 250)
      
      setHasPlayed(true)
    }
  }, [winnerSelected, winner, hasPlayed])

  if (!winnerSelected || !winner || winner === '0x0000000000000000000000000000000000000000') {
    return null
  }

  return (
    <Card className="border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 animate-pulse">
      <CardHeader>
        <div className="flex items-center gap-3 justify-center">
          <Trophy className="h-12 w-12 text-yellow-500" />
          <CardTitle className="text-4xl font-bold text-center text-yellow-700 dark:text-yellow-400">
            🎉 Winner Selected! 🎉
          </CardTitle>
          <PartyPopper className="h-12 w-12 text-yellow-500" />
        </div>
        <CardDescription className="text-center text-lg text-orange-700 dark:text-orange-400">
          The lottery has been completed!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Winning Address:</p>
            <p className="text-lg font-mono bg-white dark:bg-gray-900 p-3 rounded-lg border-2 border-yellow-400">
              {winner}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Prize Amount:</p>
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
              ${Number(prizeAmount).toFixed(2)} USDC
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

