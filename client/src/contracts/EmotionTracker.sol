// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EmotionTracker
 * @dev A simple smart contract to track daily emotions and reward users for self-reflection on Celo.
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

    // Mapping to track last check-in time to prevent spamming (optional cooldown)
    mapping(address => uint256) public lastCheckIn;

    // Event emitted when a new emotion is logged
    event EmotionLogged(address indexed user, string emotionType, uint256 timestamp);

    // Token reward system (Simulated for this example)
    mapping(address => uint256) public rewardBalance;

    uint256 public constant REWARD_PER_ENTRY = 10 ether; // 10 tokens (using ether unit for simplicity)
    uint256 public constant COOLDOWN_TIME = 1 hours;

    /**
     * @dev Log an emotion and earn rewards.
     * @param _emotionType The type of emotion (e.g., "Happy")
     * @param _intensity How strong the emotion is (1-10)
     * @param _notes Optional notes about the feeling
     */
    function logEmotion(string memory _emotionType, uint256 _intensity, string memory _notes) public {
        require(_intensity >= 1 && _intensity <= 10, "Intensity must be between 1 and 10");
        // require(block.timestamp >= lastCheckIn[msg.sender] + COOLDOWN_TIME, "Please wait before logging again");

        EmotionEntry memory newEntry = EmotionEntry({
            timestamp: block.timestamp,
            emotionType: _emotionType,
            intensity: _intensity,
            notes: _notes
        });

        userEntries[msg.sender].push(newEntry);
        lastCheckIn[msg.sender] = block.timestamp;

        // Distribute reward (Internal accounting for this demo)
        rewardBalance[msg.sender] += REWARD_PER_ENTRY;

        emit EmotionLogged(msg.sender, _emotionType, block.timestamp);
    }

    /**
     * @dev Get the total number of entries for the caller.
     */
    function getEntryCount() public view returns (uint256) {
        return userEntries[msg.sender].length;
    }

    /**
     * @dev Get a specific entry.
     */
    function getEntry(uint256 _index) public view returns (uint256, string memory, uint256, string memory) {
        require(_index < userEntries[msg.sender].length, "Index out of bounds");
        EmotionEntry memory entry = userEntries[msg.sender][_index];
        return (entry.timestamp, entry.emotionType, entry.intensity, entry.notes);
    }
    
    /**
     * @dev Get all entries for the caller (Careful with gas limits in production).
     */
    function getAllEntries() public view returns (EmotionEntry[] memory) {
        return userEntries[msg.sender];
    }
}
