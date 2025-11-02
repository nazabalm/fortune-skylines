# Deploying the Updated RefBoom Contract

## Important Notes

You have an **old contract** deployed at `0xd1c224f70e62eD24Dffa4690494506ab1ED9c674` with **100 USDC** entry fees.

The new contract has **0.001 USDC** entry fees (better for testing).

## Deploy the New Contract

### Option 1: Browser Deployer (Recommended)

1. Navigate to contracts directory:
   ```bash
   cd packages/contracts
   ```

2. Open the deployer in your browser:
   ```bash
   python3 -m http.server 8080
   # Then open http://localhost:8080/deployer.html
   ```

3. Connect MetaMask to Base Sepolia

4. Fill in the parameters:
   - **USDC Token**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
   - **VRF Coordinator**: `0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE`
   - **Key Hash**: `0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5efd44bf71` (30 gwei)
   - **Subscription ID**: Your Chainlink VRF subscription ID

5. Click "Deploy RefBoom Contract"

6. Copy the deployed contract address

### Option 2: Hardhat Deploy

```bash
cd packages/contracts
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## Update Frontend Configuration

After deployment, update your `.env.local`:

```bash
cd packages/frontend
# Edit .env.local
NEXT_PUBLIC_REFBOOM_BASE_SEPOLIA=your_new_contract_address_here
```

Then restart your dev server:
```bash
npm run dev
```

## Test the New Contract

1. Get some testnet USDC from a faucet
2. Open http://localhost:3000
3. Connect wallet to Base Sepolia
4. Join with **0.001 USDC** entry fee
5. Share your referral link
6. Test with multiple wallets!

## Old vs New Fees

| Item | Old Contract | New Contract |
|------|--------------|--------------|
| Entry Fee | 100 USDC | 0.001 USDC ✅ |
| Referral Reward | 50 USDC | 0.0005 USDC ✅ |
| Prize Pool | 40 USDC | 0.0004 USDC ✅ |
| Platform Fee | 10 USDC | 0.0001 USDC ✅ |

Perfect for testing! 🎉

