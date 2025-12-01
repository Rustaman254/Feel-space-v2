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

    // Struct to store a game session
    struct GameSession {
        uint256 timestamp;
        string gameId;
        uint256 score;
        uint256 reward; // FEELS earned from this session
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

    // Mapping from user address to their list of game sessions
    mapping(address => GameSession[]) public userGameSessions;

    // Mapping to track last check-in time to prevent spamming
    mapping(address => uint256) public lastCheckIn;

    // NEW: track total games played per user
    mapping(address => uint256) public totalGamesPlayed;

    // NEW: track all users who have ever interacted
    address[] public users;
    mapping(address => bool) private isKnownUser;

    // NEW: public emotion feed entries
    struct PublicEmotion {
        address user;
        uint256 timestamp;
        string emotionType;
        uint256 intensity;
        uint256 reward;
    }

    PublicEmotion[] public publicFeed;
    uint256 public constant MAX_PUBLIC_FEED = 50;

    // Events
    event EmotionLogged(address indexed user, string emotionType, uint256 timestamp);
    event GamePurchased(address indexed user, string gameId, uint256 price);
    event TokensEarned(address indexed user, uint256 amount, string reason);
    event GameCompleted(address indexed user, string gameId, uint256 score, uint256 reward, uint256 timestamp);

    uint256 public constant REWARD_PER_ENTRY = 10 ether; // 10 FEELS
    uint256 public constant REWARD_PER_GAME = 5 ether;   // kept for compatibility if needed

    address public owner;

    constructor() {
        owner = msg.sender;

        // Initialize Games
        games["bubble"] = GameInfo("bubble", 0, true);
        games["memory"] = GameInfo("memory", 0, true);
        games["breathing"] = GameInfo("breathing", 0, true);
        games["tictactoe"] = GameInfo("tictactoe", 0, true);
        games["journal"] = GameInfo("journal", 50 ether, false); // Premium game
        games["zen"] = GameInfo("zen", 100 ether, false);        // Premium game
    }

    // INTERNAL: register user once
    function _registerUser(address user) internal {
        if (!isKnownUser[user]) {
            isKnownUser[user] = true;
            users.push(user);
        }
    }

    /**
     * @dev Log an emotion and earn tokens.
     * Also appends to the publicFeed for community view.
     */
    function logEmotion(
        string memory _emotionType,
        uint256 _intensity,
        string memory _notes
    ) public {
        require(_intensity >= 1 && _intensity <= 10, "Intensity must be between 1 and 10");

        _registerUser(msg.sender);

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

        // Push to public feed (newest at end)
        publicFeed.push(
            PublicEmotion({
                user: msg.sender,
                timestamp: block.timestamp,
                emotionType: _emotionType,
                intensity: _intensity,
                reward: REWARD_PER_ENTRY
            })
        );
        // No array shrinking here to save gas; frontend will just ask for last N

        emit EmotionLogged(msg.sender, _emotionType, block.timestamp);
        emit TokensEarned(msg.sender, REWARD_PER_ENTRY, "Daily Check-in");
    }

    /**
     * @dev Record game completion and reward tokens (ON-CHAIN session + dynamic rewards).
     * Base reward: 5 FEELS
     * Extra reward: score * 0.01 FEELS (score / 100 in 18-decimal units)
     */
    function completeGame(string memory _gameId, uint256 _score) public {
        // Verify user has access
        require(games[_gameId].isFree || userGames[msg.sender][_gameId], "Game not owned");

        _registerUser(msg.sender);

        uint256 baseReward = 5 ether;                 // 5 FEELS
        uint256 extraReward = (_score * 1 ether) / 100; // score * 0.01 FEELS
        uint256 totalReward = baseReward + extraReward;

        // Store session on-chain
        GameSession memory session = GameSession({
            timestamp: block.timestamp,
            gameId: _gameId,
            score: _score,
            reward: totalReward
        });

        userGameSessions[msg.sender].push(session);
        totalGamesPlayed[msg.sender] += 1;

        // Reward for playing
        _mint(msg.sender, totalReward);

        emit GameCompleted(msg.sender, _gameId, _score, totalReward, block.timestamp);
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
     * @dev Get all entries for any user.
     */
    function getUserHistory(address user) public view returns (EmotionEntry[] memory) {
        return userEntries[user];
    }

    /**
     * @dev Get all game sessions for a user.
     */
    function getUserGameSessions(address user) public view returns (GameSession[] memory) {
        return userGameSessions[user];
    }

    /**
     * @dev Helper to get a user's FEELS balance.
     */
    function getUserBalance(address user) public view returns (uint256) {
        return balances[user];
    }

    /**
     * @dev Check if user owns a game.
     */
    function hasGame(address user, string memory gameId) public view returns (bool) {
        return games[gameId].isFree || userGames[user][gameId];
    }

    // -------- Community helpers for frontend --------

    function getUserCount() external view returns (uint256) {
        return users.length;
    }

    function getUserAt(uint256 index) external view returns (address) {
        require(index < users.length, "Index out of bounds");
        return users[index];
    }

    function getRecentPublicEmotions(uint256 limit)
        external
        view
        returns (PublicEmotion[] memory)
    {
        uint256 total = publicFeed.length;
        if (limit == 0 || limit > total) {
            limit = total;
        }

        PublicEmotion[] memory result = new PublicEmotion[](limit);
        for (uint256 i = 0; i < limit; i++) {
            // newest first
            result[i] = publicFeed[total - 1 - i];
        }
        return result;
    }

    struct LeaderboardEntry {
        address user;
        uint256 feels;
        uint256 gamesPlayed;
    }

    function getLeaderboard(uint256 limit)
        external
        view
        returns (LeaderboardEntry[] memory)
    {
        uint256 total = users.length;
        if (limit == 0 || limit > total) {
            limit = total;
        }

        LeaderboardEntry[] memory list = new LeaderboardEntry[](limit);
        for (uint256 i = 0; i < limit; i++) {
            address u = users[i];
            list[i] = LeaderboardEntry({
                user: u,
                feels: balances[u],
                gamesPlayed: totalGamesPlayed[u]
            });
        }
        // not sorted on-chain; frontend will sort
        return list;
    }
}
