# 🚀 Deploy New Contract NOW

## ⚠️ Current Problem

You're hitting an **OLD contract** with **100 USDC** entry fees, but the frontend expects **0.001 USDC**. This causes the allowance error.

## ✅ Solution: Deploy New Contract

### Step 1: Open Browser Deployer

The deployer is ready at: **http://localhost:8081/deployer.html**

(If it's not running, start it: `cd packages/contracts && python3 -m http.server 8081`)

### Step 2: Connect Wallet & Deploy

1. Open http://localhost:8081/deployer.html in your browser
2. Make sure you're on **Base Sepolia** in MetaMask
3. Click "Connect MetaMask"
4. Verify the parameters are pre-filled correctly:
   - USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
   - VRF Coordinator: `0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE`
   - Key Hash: `0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71`
   - Subscription ID: (your Chainlink VRF subscription ID)
5. Click "🚀 Deploy RefBoom Contract"
6. Confirm in MetaMask
7. **Copy the new contract address** when it appears

### Step 3: Update Frontend

Edit `packages/frontend/.env.local`:
```bash
NEXT_PUBLIC_REFBOOM_BASE_SEPOLIA=your_new_contract_address_here
```

### Step 4: Restart Dev Server

```bash
cd packages/frontend
# Stop current dev server (Ctrl+C)
npm run dev
```

### Step 5: Test!

1. Open http://localhost:3000
2. Connect wallet to Base Sepolia
3. You should now see **0.001 USDC** entry fee
4. Join with the new contract!

## 🎉 What's Fixed

- ✅ Error handling for allowance errors
- ✅ Proper controlled input (no more warnings)
- ✅ Deployer ready with latest contract
- ✅ Better error messages

## 📊 Fee Comparison

| Item | Old (100 USDC) | New (0.001 USDC) |
|------|----------------|------------------|
| Entry Fee | 100 USDC ❌ | 0.001 USDC ✅ |
| Referral Reward | 50 USDC ❌ | 0.0005 USDC ✅ |
| Prize Pool | 40 USDC ❌ | 0.0004 USDC ✅ |
| Platform Fee | 10 USDC ❌ | 0.0001 USDC ✅ |

Perfect for testing on testnet! 🚀

