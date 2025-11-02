import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const artifact = JSON.parse(
  readFileSync(join(__dirname, '../artifacts/contracts/RefBoom.sol/RefBoom.json'))
);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RefBoom Deployer</title>
    <script type="importmap">
    {
        "imports": {
            "viem": "https://esm.sh/viem@2.30.0"
        }
    }
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            max-width: 700px;
            margin: 20px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { 
            color: #333; 
            margin-bottom: 30px;
            text-align: center;
            font-size: 2em;
        }
        label {
            display: block;
            margin: 15px 0 5px;
            color: #555;
            font-weight: 600;
        }
        input, select {
            width: 100%;
            padding: 15px;
            margin: 5px 0;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 14px;
            box-sizing: border-box;
            transition: border-color 0.3s;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover:not(:disabled) { 
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        button:disabled { 
            background: #ccc; 
            cursor: not-allowed;
        }
        .status {
            margin-top: 25px;
            padding: 20px;
            border-radius: 10px;
            border-left: 5px solid #4caf50;
            background: #f1f8f4;
            color: #2e7d32;
        }
        .error {
            border-left-color: #f44336;
            background: #fef5f5;
            color: #c62828;
        }
        code {
            background: #f5f5f5;
            padding: 3px 8px;
            border-radius: 5px;
            font-size: 13px;
            word-break: break-all;
            display: block;
            margin-top: 10px;
        }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 RefBoom Deployer</h1>
        
        <label>Network:</label>
        <select id="network">
            <option value="baseSepolia">Base Sepolia Testnet</option>
            <option value="base">Base Mainnet</option>
        </select>
        
        <label>USDC Token Address:</label>
        <input type="text" id="usdcAddress" value="0x036CbD53842c5426634e7929541eC2318f3dCF7e">
        
        <label>VRF Coordinator:</label>
        <input type="text" id="vrfCoordinator" value="0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE">
        
        <label>Key Hash:</label>
        <input type="text" id="keyHash" value="0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71">
        
        <label>Subscription ID:</label>
        <input type="number" id="subscriptionId" value="1">
        
        <label>Genesis Referrer Address:</label>
        <input type="text" id="genesisReferrer" placeholder="0x...">
        
        <button onclick="connectWallet()" id="connectBtn">Connect MetaMask</button>
        <button onclick="deploy()" id="deployBtn" disabled>🚀 Deploy RefBoom Contract</button>
        
        <div id="status"></div>
    </div>

        <script type="module">
        import { createWalletClient, createPublicClient, custom, http, defineChain } from 'viem';
        
        const BYTECODE = '${artifact.bytecode}';
        const ABI = ${JSON.stringify(artifact.abi)};
        
        // Network configurations
        const networkConfigs = {
            baseSepolia: {
                usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
                vrf: '0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE',
                keyHash: '0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71'
            },
            base: {
                usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                vrf: '0x08e9C878321F3C8e28D8Cb65f1F02d62437BC984', // Placeholder - Chainlink VRF not supported on Base mainnet yet
                keyHash: '0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71' // Placeholder
            }
        };
        
        // Update form when network changes
        document.getElementById('network').addEventListener('change', function() {
            const network = this.value;
            const config = networkConfigs[network];
            if (config) {
                document.getElementById('usdcAddress').value = config.usdc;
                document.getElementById('vrfCoordinator').value = config.vrf;
                document.getElementById('keyHash').value = config.keyHash;
            }
        });
        
        const baseSepoliaChain = defineChain({
            id: 84532,
            name: 'Base Sepolia',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
                default: {
                    http: ['https://sepolia.base.org'],
                },
            },
            blockExplorers: {
                default: {
                    name: 'BaseScan',
                    url: 'https://sepolia.basescan.org',
                },
            },
        });
        
        const baseChain = defineChain({
            id: 8453,
            name: 'Base',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
                default: {
                    http: ['https://mainnet.base.org'],
                },
            },
            blockExplorers: {
                default: {
                    name: 'BaseScan',
                    url: 'https://basescan.org',
                },
            },
        });
        
        const networks = {
            baseSepolia: {
                chain: baseSepoliaChain,
                chainId: 84532n,
                rpcUrl: 'https://sepolia.base.org',
                name: 'Base Sepolia'
            },
            base: {
                chain: baseChain,
                chainId: 8453n,
                rpcUrl: 'https://mainnet.base.org',
                name: 'Base Mainnet'
            }
        };

        let walletClient, publicClient;
        let currentAccount;

        window.connectWallet = async () => {
            try {
                const network = networks[document.getElementById('network').value];
                
                if (!window.ethereum) {
                    throw new Error('MetaMask not found! Please install MetaMask.');
                }

                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                currentAccount = accounts[0];

                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (parseInt(chainId, 16) !== Number(network.chainId)) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0x' + network.chainId.toString(16) }],
                        });
                    } catch (err) {
                        // Chain not added, add it
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x' + network.chainId.toString(16),
                                chainName: network.name,
                                rpcUrls: [network.rpcUrl],
                                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
                            }]
                        });
                    }
                }

                walletClient = createWalletClient({
                    account: currentAccount,
                    chain: network.chain,
                    transport: custom(window.ethereum)
                });

                publicClient = createPublicClient({
                    transport: http(network.rpcUrl)
                });

                document.getElementById('status').innerHTML = 
                    '<div class="status">✅ Connected: <code>' + 
                    currentAccount.slice(0,6) + '...' + currentAccount.slice(-4) + '</code></div>';
                document.getElementById('connectBtn').disabled = true;
                document.getElementById('deployBtn').disabled = false;
            } catch (error) {
                document.getElementById('status').innerHTML = 
                    '<div class="status error">❌ ' + error.message + '</div>';
            }
        };

        window.deploy = async () => {
            try {
                if (!walletClient) throw new Error('Please connect wallet first!');

                document.getElementById('status').innerHTML = 
                    '<div class="status">⏳ Creating deployment transaction...</div>';

                const usdcAddress = document.getElementById('usdcAddress').value;
                const vrfCoordinator = document.getElementById('vrfCoordinator').value;
                const keyHash = document.getElementById('keyHash').value;
                const subIdInput = document.getElementById('subscriptionId').value;
                const genesisReferrer = document.getElementById('genesisReferrer').value;
                // Convert to BigInt for uint256
                const subscriptionId = BigInt(subIdInput);

                document.getElementById('status').innerHTML = 
                    '<div class="status">⏳ Sending transaction... Please confirm in MetaMask</div>';

                const hash = await walletClient.deployContract({
                    abi: ABI,
                    bytecode: BYTECODE,
                    args: [usdcAddress, vrfCoordinator, keyHash, subscriptionId, genesisReferrer]
                });

                document.getElementById('status').innerHTML = 
                    '<div class="status">⏳ Waiting for confirmation...</div>';

                const txReceipt = await publicClient.waitForTransactionReceipt({ hash });

                document.getElementById('status').innerHTML = 
                    '<div class="status">✅ Deployed successfully!<br><br>' +
                    'Contract Address:<code>' + txReceipt.contractAddress + '</code></div>';
            } catch (error) {
                document.getElementById('status').innerHTML = 
                    '<div class="status error">❌ ' + error.message + '</div>';
                console.error(error);
            }
        };
    </script>
</body>
</html>`;

console.log('Writing deployer.html...');
writeFileSync(join(__dirname, '../deployer.html'), html);
console.log('✅ deployer.html created! Open it in your browser to deploy.');

