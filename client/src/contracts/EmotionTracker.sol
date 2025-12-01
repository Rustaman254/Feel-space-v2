// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EmotionTracker
 * @dev A simple smart contract to track daily emotions and reward users for self-reflection on Celo.
 */
contract EmotionTracker {
    // Token System
    mapping(address => uint256) public balances;
    string public constant symbol = "FEELS";
    string public constant name = "Feels Token";
    uint8 public constant decimals = 18;

    // Struct to store an emotion entry
    struct EmotionEntry {
        uint256 timestamp;
        string emotionType; // e.g., "Happy", "Anxious", "Sad", "Angry"
        uint256 intensity;  // 1-10 scale
        string notes;
    }

    // Game Purchase System
    struct GameInfo {
        string gameId;
        uint256 price;
        bool isFree;
    }
    
    mapping(string => GameInfo) public games;
    mapping(address => mapping(string => bool)) public userGames; // user => gameId => purchased

    // Mapping from user address to their list of entries
    mapping(address => EmotionEntry[]) public userEntries;

    // Mapping to track last check-in time to prevent spamming
    mapping(address => uint256) public lastCheckIn;

    // Game Session Tracking
    struct GameSession {
        uint256 timestamp;
        string gameId;
        uint256 score;
    }

    mapping(address => GameSession[]) public userGameSessions;

    // Event emitted when a new emotion is logged
    event EmotionLogged(address indexed user, string emotionType, uint256 timestamp);
    event GamePurchased(address indexed user, string gameId, uint256 price);
    event TokensEarned(address indexed user, uint256 amount, string reason);

    uint256 public constant REWARD_PER_ENTRY = 10 ether; // 10 FEELS
    uint256 public constant BASE_GAME_REWARD = 5 ether;  // 5 FEELS base

    address public owner;

    constructor() {
        owner = msg.sender;
        
        // Initialize Games
        games["bubble"] = GameInfo("bubble", 0, true);
        games["memory"] = GameInfo("memory", 0, true);
        games["breathing"] = GameInfo("breathing", 0, true);
        games["journal"] = GameInfo("journal", 50 ether, false); // Premium game
        games["zen"] = GameInfo("zen", 100 ether, false);        // Premium game
    }

    /**
     * @dev Log an emotion and earn tokens.
     */
    function logEmotion(string memory _emotionType, uint256 _intensity, string memory _notes) public {
        require(_intensity >= 1 && _intensity <= 10, "Intensity must be between 1 and 10");
        
        EmotionEntry memory newEntry = EmotionEntry({
            timestamp: block.timestamp,
            emotionType: _emotionType,
            intensity: _intensity,
            notes: _notes
        });

        userEntries[msg.sender].push(newEntry);
        lastCheckIn[msg.sender] = block.timestamp;

        // Reward user
        _mint(msg.sender, REWARD_PER_ENTRY);
        
        emit EmotionLogged(msg.sender, _emotionType, block.timestamp);
        emit TokensEarned(msg.sender, REWARD_PER_ENTRY, "Daily Check-in");
    }

    /**
     * @dev Record game completion and reward tokens based on score.
     */
    function completeGame(string memory _gameId, uint256 _score) public {
        // Verify user has access
        require(games[_gameId].isFree || userGames[msg.sender][_gameId], "Game not owned");
        
        // Record session
        GameSession memory newSession = GameSession({
            timestamp: block.timestamp,
            gameId: _gameId,
            score: _score
        });
        userGameSessions[msg.sender].push(newSession);

        // Calculate Reward: Base + (Score * 0.01 FEELS)
        // Assuming score is an integer, we treat it as 0.01 ether per point
        // Example: Score 100 => 1.00 FEELS
        uint256 scoreReward = _score * 10**16; // 0.01 ether
        uint256 totalReward = BASE_GAME_REWARD + scoreReward;

        // Reward for playing
        _mint(msg.sender, totalReward);
        emit TokensEarned(msg.sender, totalReward, "Game Completed");
    }

    /**
     * @dev Purchase a premium game with FEELS tokens.
     */
    function buyGame(string memory _gameId) public {
        GameInfo memory game = games[_gameId];
        require(game.price > 0, "Game does not exist or is free");
        require(!userGames[msg.sender][_gameId], "Already owned");
        require(balances[msg.sender] >= game.price, "Insufficient FEELS");

        // Burn tokens for purchase
        balances[msg.sender] -= game.price;
        userGames[msg.sender][_gameId] = true;

        emit GamePurchased(msg.sender, _gameId, game.price);
    }

    /**
     * @dev Internal mint function.
     */
    function _mint(address to, uint256 amount) internal {
        balances[to] += amount;
    }

    /**
     * @dev Get all entries for the caller.
     */
    function getHistory() public view returns (EmotionEntry[] memory) {
        return userEntries[msg.sender];
    }

    /**
     * @dev Get all game sessions for the caller.
     */
    function getUserGameSessions() public view returns (GameSession[] memory) {
        return userGameSessions[msg.sender];
    }
    
    /**
     * @dev Check if user owns a game.
     */
    function hasGame(address user, string memory gameId) public view returns (bool) {
        return games[gameId].isFree || userGames[user][gameId];
    }
}
