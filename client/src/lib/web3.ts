import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

const ABI = [
  "function logEmotion(string memory _emotionType, uint256 _intensity, string memory _notes) public",
  "function completeGame(string memory _gameId, uint256 _score) public",
  "function buyGame(string memory _gameId) public",
  "function getHistory() public view returns (tuple(uint256 timestamp, string emotionType, uint256 intensity, string notes)[])",
  "function balances(address user) public view returns (uint256)",
  "function hasGame(address user, string memory gameId) public view returns (bool)",
  "event EmotionLogged(address indexed user, string emotionType, uint256 timestamp)",
  "event GamePurchased(address indexed user, string gameId, uint256 price)",
  "event TokensEarned(address indexed user, uint256 amount, string reason)"
];

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  async initialize() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('No wallet found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.signer);
  }

  async logEmotion(emotion: string, intensity: number, notes: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.logEmotion(emotion, intensity, notes);
    return await tx.wait();
  }

  async completeGame(gameId: string, score: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.completeGame(gameId, score);
    return await tx.wait();
  }

  async buyGame(gameId: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.buyGame(gameId);
    return await tx.wait();
  }

  async getBalance(address: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    const balance = await this.contract.balances(address);
    return ethers.formatEther(balance);
  }

  async getHistory() {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getHistory();
  }

  async hasGame(address: string, gameId: string): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.hasGame(address, gameId);
  }
}

export const web3Service = new Web3Service();
