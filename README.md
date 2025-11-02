# 🎰 RefBoom - Win Big with Referrals!

A decentralized lottery dApp built on Base blockchain with referral rewards.

## 🌟 Features

- 🎰 **Lottery System**: 1000 user target, winner selected via Chainlink VRF
- 🔗 **Referral Program**: Earn 50% of entry fee per referral (max 20/day)
- 💰 **USDC Payments**: Seamless integration with Circle USDC
- 🎨 **Beautiful UI**: Modern gradient design with animations
- 📱 **Responsive**: Mobile-first design
- 🔒 **Secure**: Built with audited Chainlink VRF
- ⚡ **Real-time**: Live updates every 5 seconds

## 🏗️ Project Structure

```
RefBoom/
├── packages/
│   ├── contracts/          # Solidity smart contracts
│   │   ├── RefBoom.sol     # Main lottery contract
│   │   ├── deployer.html   # Browser-based deployment
│   │   └── scripts/        # Deployment scripts
│   │
│   └── frontend/           # Next.js 16 frontend
│       ├── app/            # App Router pages
│       ├── components/     # UI components
│       ├── hooks/          # React hooks
│       └── lib/            # Utilities & configs
│
├── DEPLOYMENT_SUMMARY.md   # Detailed deployment info
├── PRE_LAUNCH_CHECKLIST.md # Launch readiness checklist
├── DEPLOY_NEW_CONTRACT.md  # Contract deployment guide
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <your-repo>
cd RefBoom
```

### 2. Install Dependencies
```bash
# Contract dependencies
cd packages/contracts
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment
```bash
cd packages/frontend
cp env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_REFBOOM_BASE_SEPOLIA=your_deployed_contract_address
```

### 4. Deploy Contract
```bash
cd packages/contracts
npm run build-deployer
python3 -m http.server 8080
# Open http://localhost:8080/deployer.html
```

See `DEPLOY_NEW_CONTRACT.md` for details.

### 5. Start Frontend
```bash
cd packages/frontend
npm run dev
```

Open http://localhost:3000 🎉

## 📝 How It Works

### For Participants

1. **Join**: Pay 0.001 USDC entry fee
2. **Refer**: Share your unique referral link
3. **Earn**: Get 0.0005 USDC per successful referral (max 20/day)
4. **Win**: When we hit 1000 users, one winner takes the entire prize pool!

### Prize Distribution

- 🎯 **Prize Pool**: 40% of entry fees (0.0004 USDC per entry)
- 💸 **Referrer**: 50% of entry fee (0.0005 USDC per referral)
- 🔧 **Platform**: 10% of entry fee (0.0001 USDC)

### Smart Contract Details

- **Entry Fee**: 0.001 USDC (for testing on Base Sepolia)
- **Target**: 1000 participants
- **Random Selection**: Chainlink VRF v2.5
- **Security**: Reentrancy guards, validated inputs
- **Network**: Base Sepolia (testnet) / Base (mainnet)

## 🛠️ Tech Stack

### Smart Contracts
- Solidity 0.8.28
- Hardhat 3.x
- Chainlink VRF v2.5
- OpenZeppelin Contracts
- Viem for deployment

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- RainbowKit + wagmi v2
- React Query
- canvas-confetti

## 📚 Documentation

- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - Full deployment details
- [PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md) - Launch readiness
- [DEPLOY_NEW_CONTRACT.md](./DEPLOY_NEW_CONTRACT.md) - Contract deployment guide
- [packages/frontend/README.md](./packages/frontend/README.md) - Frontend docs
- [packages/frontend/QUICKSTART.md](./packages/frontend/QUICKSTART.md) - Quick start

## 🔐 Security Considerations

- ✅ Reentrancy guards implemented
- ✅ Input validation on all functions
- ✅ Referrer validation (must be existing participant)
- ✅ Daily referral limits enforced
- ✅ Owner-only access controls
- ✅ Chainlink VRF for provable randomness
- ✅ USDC-only payments (no ETH/NATIVE)

## 🧪 Testing

### Test on Base Sepolia

1. Get testnet USDC from faucet
2. Connect MetaMask to Base Sepolia
3. Approve 0.001 USDC
4. Join with a valid referrer
5. Share your referral link
6. Test with multiple wallets

## 📊 Current Status

- ✅ Smart contracts implemented and compiled
- ✅ Frontend UI complete and beautiful
- ✅ Web3 integration working
- ✅ Error handling robust
- ✅ Mobile responsive
- ⏳ Awaiting contract deployment
- ⏳ Awaiting WalletConnect Project ID

## 🚨 Important Notes

- Current contract address in `.env.local` is **old version** (100 USDC fees)
- Deploy **new contract** with 0.001 USDC fees before testing
- Get a WalletConnect Project ID from cloud.walletconnect.com
- Ensure Chainlink VRF subscription is funded with LINK
- First user must use contract owner as referrer

## 🌐 Deploy to Vercel

The frontend is configured for easy deployment to Vercel:

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the monorepo setup via `vercel.json`

3. **Set Environment Variables**:
   In Vercel dashboard, add these under Settings → Environment Variables:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_REFBOOM_BASE_SEPOLIA=your_contract_address
   NEXT_PUBLIC_REFBOOM_BASE=your_mainnet_contract_address
   ```

4. **Deploy**:
   - Click "Deploy"
   - Your FortuneSkylines lottery will be live!

The `vercel.json` configuration ensures only the frontend is built, avoiding Hardhat dependency conflicts.

## 📄 License

ISC

## 🙏 Acknowledgments

- Chainlink VRF for provable randomness
- OpenZeppelin for security patterns
- Base for the low-fee L2
- Circle for USDC stability

---

**Ready to launch?** Check out `PRE_LAUNCH_CHECKLIST.md`!

