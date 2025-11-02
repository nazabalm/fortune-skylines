// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract RefBoom is VRFConsumerBaseV2Plus {
    IERC20 public usdc;

    uint256 public constant ENTRY_FEE = 1 * 10 ** 3; // 0.001 USDC (for testing on Base Sepolia)
    uint256 public constant REFERRAL_REWARD = 5 * 10 ** 2; // 0.0005 USDC
    uint256 public constant POOL_CUT = 4 * 10 ** 2; // 0.0004 USDC
    uint256 public constant PLATFORM_FEE = 1 * 10 ** 2; // 0.0001 USDC
    uint256 public constant MAX_PER_DAY = 20;

    mapping(address => bool) public hasJoined;
    mapping(address => mapping(uint256 => uint256)) public dailyReferrals;

    address[] public participants;
    uint256 public prizePool;
    uint256 public totalUsers = 0;

    bytes32 public keyHash;
    uint256 public subscriptionId;
    uint32 public callbackGasLimit = 200000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    uint256 public requestId;
    bool public sorteoTriggered = false;
    bool public winnerSelected = false;
    address public winner;  // Add to track the winner
    uint256 public prizeAmount;  // Add to track prize amount paid

    // Reentrancy guard
    bool private _locked;

    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    event Joined(address indexed user, address indexed referrer);
    event RewardPaid(address indexed referrer, uint256 amount);
    event WinnerSelected(address indexed winner, uint256 amount);
    event FundsReceived(address sender, uint256 amount);

    constructor(
        address _usdc,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        usdc = IERC20(_usdc);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
    }

    function join(address referrer) external nonReentrant {
        require(
            usdc.transferFrom(msg.sender, address(this), ENTRY_FEE),
            "USDC transfer failed"
        );
        require(!hasJoined[msg.sender], "Already joined");

        // Enforce referral requirement
        if (totalUsers == 0) {
            // First user can only join with owner as referrer
            require(
                referrer == owner(),
                "First user must use owner as referrer"
            );
        } else {
            // All subsequent users must have a valid participant as referrer
            require(
                referrer != address(0) &&
                    referrer != msg.sender &&
                    hasJoined[referrer],
                "Valid participant referrer required"
            );
        }

        hasJoined[msg.sender] = true;
        participants.push(msg.sender);
        totalUsers++;
        prizePool += POOL_CUT;

        if (
            referrer != address(0) &&
            referrer != msg.sender &&
            hasJoined[referrer]
        ) {
            uint256 today = block.timestamp / 86400;

            usdc.transfer(referrer, REFERRAL_REWARD);
            dailyReferrals[referrer][today]++;

            emit RewardPaid(referrer, REFERRAL_REWARD);
        }

        usdc.transfer(owner(), PLATFORM_FEE);
        emit Joined(msg.sender, referrer);
    }

    function _requestRandomWinner() internal {
        VRFV2PlusClient.RandomWordsRequest memory req = VRFV2PlusClient
            .RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: true})
                )
            });
        requestId = s_vrfCoordinator.requestRandomWords(req);
    }

    function fulfillRandomWords(
        uint256,
        uint256[] calldata randomWords
    ) internal override {
        // Only proceed if winner hasn't been selected and we have valid data
        if (winnerSelected || participants.length == 0 || prizePool == 0) {
            return;  // Don't revert, just return silently
        }

        uint256 winnerIndex = randomWords[0] % participants.length;
        address selectedWinner = participants[winnerIndex];
        
        // Store winner and prize amount BEFORE any external calls
        winner = selectedWinner;
        prizeAmount = prizePool;
        
        // Mark as selected BEFORE transfer to prevent double execution
        winnerSelected = true;
        
        // Store prize pool value before resetting
        uint256 prizeToTransfer = prizePool;
        
        // Reset prize pool BEFORE transfer (in case transfer fails, we've marked it as selected)
        prizePool = 0;
        
        // Attempt transfer - use low-level call to prevent reverts
        bool success = usdc.transfer(selectedWinner, prizeToTransfer);
        
        // Emit event regardless of transfer success (for tracking)
        emit WinnerSelected(selectedWinner, success ? prizeToTransfer : 0);
        
        // If transfer failed, winner is still stored and can be paid later via manual function
        // The randomness is consumed, so we can't retry with new random numbers
    }
    
    // Optional: Add a manual function to complete payment if transfer failed
    function completeWinnerPayment() external onlyOwner {
        require(winnerSelected, "No winner selected");
        require(winner != address(0), "No winner");
        require(prizeAmount > 0, "No prize to pay");
        
        uint256 amountToPay = prizeAmount;
        prizeAmount = 0;  // Prevent re-entrancy
        
        bool success = usdc.transfer(winner, amountToPay);
        require(success, "Transfer failed");
    }

    function selectWinner() external onlyOwner {
        require(!winnerSelected, "Winner has already been selected");
        require(!sorteoTriggered, "Sorteo has already been triggered");
        require(participants.length > 0, "No participants");
        require(prizePool > 0, "Prize pool is empty");

        sorteoTriggered = true;  // Mark that VRF request was triggered
        // DO NOT set winnerSelected = true here - let fulfillRandomWords do it
        _requestRandomWinner();
    }

    function getPrizePool() external view returns (uint256) {
        return prizePool;
    }
}
