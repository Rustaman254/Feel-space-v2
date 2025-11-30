// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EmotionTracker
 * @dev A simple smart contract to track daily emotions and reward users for self-reflection on Celo.
 *      DEPLOYMENT INSTRUCTIONS:
 *      1. Deploy this contract to Celo Alfajores Testnet.
 *      2. Fund the contract with Celo/Tokens if you want it to distribute real rewards (optional).
 *      3. Update the frontend config with the deployed contract address.
 */
contract EmotionTracker {
    // Struct to store an emotion entry
    struct EmotionEntry {
        uint256 timestamp;
        string emotionType; // e.g., "Happy", "Anxious", "Sad", "Angry"
        uint256 intensity;  // 1-10 scale
        string notes;
    }

    // Mapping from user address to their list of entries
    mapping(address => EmotionEntry[]) public userEntries;

    // Mapping to track last check-in time to prevent spamming
    mapping(address => uint256) public lastCheckIn;

    // Event emitted when a new emotion is logged
    event EmotionLogged(address indexed user, string emotionType, uint256 timestamp);

    uint256 public constant REWARD_PER_ENTRY = 1 ether; // 1 Token (simulated)
    
    // Owner for administrative tasks
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Log an emotion.
     * @param _emotionType The type of emotion (e.g., "Happy")
     * @param _intensity How strong the emotion is (1-10)
     * @param _notes Optional notes about the feeling
     */
    function logEmotion(string memory _emotionType, uint256 _intensity, string memory _notes) public {
        require(_intensity >= 1 && _intensity <= 10, "Intensity must be between 1 and 10");
        
        // Optional: Enforce cooldown
        // require(block.timestamp >= lastCheckIn[msg.sender] + 1 hours, "One entry per hour allowed");

        EmotionEntry memory newEntry = EmotionEntry({
            timestamp: block.timestamp,
            emotionType: _emotionType,
            intensity: _intensity,
            notes: _notes
        });

        userEntries[msg.sender].push(newEntry);
        lastCheckIn[msg.sender] = block.timestamp;

        emit EmotionLogged(msg.sender, _emotionType, block.timestamp);
    }

    /**
     * @dev Get the total number of entries for the caller.
     */
    function getEntryCount() public view returns (uint256) {
        return userEntries[msg.sender].length;
    }
}
