import { ethers } from 'ethers';
import deployedAddresses from '../contracts/deployed-addresses.json';

const CONTRACT_ADDRESS = deployedAddresses.EmotionTracker as string;

const ABI = [
  // core actions
  "function logEmotion(string _emotionType, uint256 _intensity, string _notes) public",
  "function completeGame(string _gameId, uint256 _score) public",
  "function buyGame(string _gameId) public",

  // user history
  "function getHistory() public view returns (tuple(uint256 timestamp, string emotionType, uint256 intensity, string notes)[])",
  "function getUserHistory(address user) public view returns (tuple(uint256 timestamp, string emotionType, uint256 intensity, string notes)[])",

  // game sessions
  "function getUserGameSessions(address user) public view returns (tuple(uint256 timestamp, string gameId, uint256 score, uint256 reward)[])",

  // balances / ownership
  "function getUserBalance(address user) public view returns (uint256)",
  "function balances(address user) public view returns (uint256)",
  "function hasGame(address user, string gameId) public view returns (bool)",

  // NEW: community views
  "function getRecentPublicEmotions(uint256 limit) public view returns (tuple(address user, uint256 timestamp, string emotionType, uint256 intensity, uint256 reward)[])",
  "function getLeaderboard(uint256 limit) public view returns (tuple(address user, uint256 feels, uint256 gamesPlayed)[])",

  // events
  "event EmotionLogged(address indexed user, string emotionType, uint256 timestamp)",
  "event GamePurchased(address indexed user, string gameId, uint256 price)",
  "event TokensEarned(address indexed user, uint256 amount, string reason)",
  "event GameCompleted(address indexed user, string gameId, uint256 score, uint256 reward, uint256 timestamp)"
];

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  async initialize() {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      throw new Error('No wallet found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    const code = await this.provider.getCode(CONTRACT_ADDRESS);
    if (!code || code === '0x') {
      throw new Error(
        `No contract deployed at ${CONTRACT_ADDRESS} on current network`
      );
    }

    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.signer);
  }

  private ensureContract() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
  }

  async logEmotion(
    emotion: string,
    intensity: number,
    notes: string
  ): Promise<{ txHash: string; receipt: any }> {
    this.ensureContract();
    const tx = await this.contract!.logEmotion(emotion, intensity, notes);
    const receipt = await tx.wait();
    return { txHash: tx.hash, receipt };
  }

  async completeGame(
    gameId: string,
    score: number
  ): Promise<{ txHash: string; receipt: any }> {
    this.ensureContract();
    const tx = await this.contract!.completeGame(gameId, score);
    const receipt = await tx.wait();
    return { txHash: tx.hash, receipt };
  }

  async buyGame(gameId: string): Promise<{ txHash: string; receipt: any }> {
    this.ensureContract();
    const tx = await this.contract!.buyGame(gameId);
    const receipt = await tx.wait();
    return { txHash: tx.hash, receipt };
  }

  async getUserFeelsBalance(address: string): Promise<string> {
    this.ensureContract();
    const balance = await this.contract!.getUserBalance(address);
    return ethers.formatEther(balance);
  }

  async getUserHistory(address: string) {
    this.ensureContract();
    return await this.contract!.getUserHistory(address);
  }

  async getUserGameSessions(address: string) {
    this.ensureContract();
    return await this.contract!.getUserGameSessions(address);
  }

  async hasGame(address: string, gameId: string): Promise<boolean> {
    this.ensureContract();
    return await this.contract!.hasGame(address, gameId);
  }

  // get all EmotionLogged events (with transactionHash) for a user
  async getUserEmotionEvents(address: string) {
    this.ensureContract();
    const filter = this.contract!.filters.EmotionLogged(address);
    const events = await this.contract!.queryFilter(filter, 0, 'latest');
    return events;
  }

  // NEW: recent public emotions for community feed
  async getRecentPublicEmotions(limit: number = 20) {
    this.ensureContract();
    const result = await this.contract!.getRecentPublicEmotions(limit);
    return result as Array<{
      user: string;
      timestamp: bigint;
      emotionType: string;
      intensity: bigint;
      reward: bigint;
    }>;
  }

  // NEW: leaderboard entries
  async getLeaderboard(limit: number = 20) {
    this.ensureContract();
    const result = await this.contract!.getLeaderboard(limit);

    // Sort by FEELS balance (descending)
    const sorted = [...result].sort((a: any, b: any) =>
      Number(b.feels) - Number(a.feels)
    );

    return sorted as Array<{
      user: string;
      feels: bigint;
      gamesPlayed: bigint;
    }>;
  }

  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }
}

export const web3Service = new Web3Service();
