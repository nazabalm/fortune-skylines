// Helper to parse and format error messages from smart contract calls

export function parseContractError(error: any): string {
  if (!error) return 'Unknown error occurred'

  const errorMessage = error.message || error.shortMessage || String(error)

  // Check for specific contract error messages
  const errorLower = errorMessage.toLowerCase()

  // USDC/Allowance errors
  if (errorLower.includes('usdc transfer failed') || errorLower.includes('transfer failed')) {
    return '❌ USDC transfer failed. Make sure you have enough balance and approved the transaction.'
  }

  if (errorLower.includes('transfer amount exceeds allowance') || errorLower.includes('exceeds allowance')) {
    return '❌ Insufficient allowance. Please approve USDC again.'
  }

  if (errorLower.includes('allowance') || errorLower.includes('insufficient')) {
    return '❌ Insufficient allowance. Please approve USDC first.'
  }

  // Already joined errors
  if (errorLower.includes('already joined')) {
    return '❌ You have already joined this lottery!'
  }

  // Referrer validation errors
  if (errorLower.includes('first user must use owner')) {
    return '❌ First user must use the contract owner as referrer.'
  }

  if (errorLower.includes('valid participant referrer required')) {
    return '❌ Invalid referrer address. The referrer must be a participant who already joined.'
  }

  if (errorLower.includes('valid referrer')) {
    return '❌ Please provide a valid referrer address.'
  }

  // Max referrals per day
  if (errorLower.includes('max') && errorLower.includes('per') && errorLower.includes('day')) {
    return '⚠️ This referrer has reached the daily referral limit (20/day).'
  }

  // User rejected transaction
  if (errorLower.includes('user rejected') || errorLower.includes('user denied')) {
    return '❌ Transaction rejected. Please approve to join the lottery.'
  }

  // Network/connection errors
  if (errorLower.includes('network') || errorLower.includes('connection')) {
    return '❌ Network error. Check your connection and try again.'
  }

  // Gas/execution errors
  if (errorLower.includes('execution reverted')) {
    return '❌ Transaction reverted. Check the error message for details.'
  }

  if (errorLower.includes('replacement underpriced')) {
    return '❌ Gas price too low. Please try again.'
  }

  // Insufficient funds
  if (errorLower.includes('insufficient funds') || errorLower.includes('insufficient balance')) {
    return '❌ Insufficient funds. Make sure you have enough USDC and ETH for gas fees.'
  }

  // Return the original error if we can't parse it
  // Try to extract the revert reason
  const revertMatch = errorMessage.match(/execution reverted: (.+)/i)
  if (revertMatch && revertMatch[1]) {
    return `❌ ${revertMatch[1]}`
  }

  return `❌ ${errorMessage.substring(0, 200)}`
}

