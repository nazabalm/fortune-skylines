# Quick Start Guide

## 🚀 Get Up and Running in 3 Steps

### 1. Get WalletConnect Project ID (30 seconds)

Visit https://cloud.walletconnect.com and create a free project. Copy your Project ID.

### 2. Configure Environment (1 minute)

```bash
cd packages/frontend
cp env.example .env.local
```

Edit `.env.local` and add:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 3. Start Dev Server (5 seconds)

```bash
npm run dev
```

Open http://localhost:3000 🎉

## 📝 Deploy Your Contract First

Before you can fully test the frontend, you need a deployed RefBoom contract.

### Option A: Browser Deployer (Easiest)

1. Navigate to `/packages/contracts` 
2. Run: `npm run build-deployer`
3. Start server: `python3 -m http.server 8080`
4. Open http://localhost:8080/deployer.html
5. Connect MetaMask
6. Fill in your Chainlink VRF subscription ID
7. Click Deploy
8. Copy the deployed contract address

### Option B: Hardhat Deploy

```bash
cd packages/contracts
npm run deploy
```

## 🔧 Update Contract Address

Add to `packages/frontend/.env.local`:
```
NEXT_PUBLIC_REFBOOM_BASE_SEPOLIA=your_deployed_address_here
```

## ✅ Test Your Frontend

1. Make sure you have testnet USDC on Base Sepolia
2. Connect wallet in the browser
3. Approve USDC (first time only)
4. Join the lottery with a valid referrer
5. Share your referral link!

## 🎯 Need Help?

- Check `/packages/frontend/README.md` for detailed docs
- Check `/DEPLOYMENT_SUMMARY.md` for full implementation details
- Contract code: `/packages/contracts/contracts/RefBoom.sol`

