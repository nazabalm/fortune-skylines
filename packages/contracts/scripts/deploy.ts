import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  console.log("Deploying with:", deployer.account.address);

  const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia
  // Base Sepolia VRF V2.5 addresses from https://docs.chain.link/vrf/v2-5/supported-networks
  const VRF = "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE"; // VRF Coordinator
  const KEY_HASH =
    "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71"; // 30 gwei
  const SUB_ID = 1n; // Create subscription in Chainlink VRF dashboard

  const refboom = await viem.deployContract("RefBoom", [
    USDC,
    VRF,
    KEY_HASH,
    SUB_ID,
  ]);
  console.log("RefBoom deployed to:", refboom.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
