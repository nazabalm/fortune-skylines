# RefBoom Frontend

A stunning Next.js 16 frontend for the RefBoom referral lottery system built on Base network.

## Features

- 🎰 **Lottery Dashboard**: Real-time prize pool tracking with animated counters
- 🔗 **Referral System**: Generate and share referral links with automatic tracking
- 💰 **USDC Integration**: Seamless USDC approval and payment flow
- 🎉 **Winner Announcement**: Real-time winner detection with confetti celebration
- 📊 **User Stats**: Track referrals and earnings with live updates
- 🎨 **Modern UI**: Beautiful gradient design with shadcn/ui components
- 📱 **Responsive**: Mobile-first design that works on all devices
- ⚡ **Fast**: Next.js 16 with Turbopack for instant hot reload

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Web3**: wagmi v2, viem, RainbowKit
- **State Management**: React Query (TanStack Query)
- **Notifications**: react-hot-toast
- **Animations**: canvas-confetti, animated counters
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible wallet
- Base Sepolia/Base network added to wallet

### Installation

1. **Install dependencies**:
   ```bash
   cd packages/frontend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with:
   - Your WalletConnect Project ID (get one at https://cloud.walletconnect.com)
   - Deployed RefBoom contract addresses

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
packages/frontend/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main lottery dashboard
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── WinnerAnnouncement.tsx  # Winner celebration
├── hooks/
│   ├── useContractData.ts  # Read contract state
│   ├── useUserStatus.ts    # User-specific data
│   └── useJoinLottery.ts   # Join flow with approvals
├── lib/
│   ├── contracts.ts        # Contract ABIs and addresses
│   ├── wagmi.ts           # Wagmi configuration
│   └── utils.ts           # Utility functions
├── providers/
│   └── Web3Provider.tsx   # Web3 providers wrapper
└── README.md
```

## Contract Integration

The frontend connects to the RefBoom smart contract on:
- **Base Sepolia** (testnet) - Chain ID: 84532
- **Base** (mainnet) - Chain ID: 8453

Contract addresses are configured in `lib/contracts.ts` and can be overridden via environment variables.

## Key Features

### Referral System
- Auto-detect referrer from URL query parameter (`?ref=0x...`)
- Generate shareable referral links
- Track daily referral counts (20/day limit)
- Display referral rewards earned

### Join Flow
1. Connect wallet with RainbowKit
2. USDC approval flow (first time only)
3. Enter referrer address
4. Submit join transaction
5. See success message and get referral link

### Live Updates
- Prize pool updates every 5 seconds
- Participant count tracking
- Winner detection with confetti celebration
- Real-time referral stats

## Deployment

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

Deploy to Vercel:
```bash
vercel --prod
```

## Configuration

### Environment Variables

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect cloud project ID
- `NEXT_PUBLIC_REFBOOM_BASE_SEPOLIA` - RefBoom contract on Base Sepolia
- `NEXT_PUBLIC_REFBOOM_BASE` - RefBoom contract on Base Mainnet

### Contract Constants

- Entry Fee: 100 USDC
- Referral Reward: 50 USDC
- Pool Cut: 40 USDC
- Platform Fee: 10 USDC
- Max Referrals/Day: 20
- Target Participants: 1000

## Development

```bash
# Run dev server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

ISC
