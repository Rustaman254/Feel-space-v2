import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { web3Service } from '@/lib/web3';

declare global {
  interface Window {
    ethereum?: any;
    // Common wallet injections
    coinbaseWalletExtension?: any;
    trustwallet?: any;
    phantom?: any;
    brave?: any;
    okxwallet?: any;
    bitkeep?: any;
    rabby?: any;
  }
}

export interface EmotionEntry {
  _id?: string;
  timestamp: number;
  emotion: string;
  intensity: number;
  notes: string;
  earned: number;
  txHash?: string;
}

export interface GameSessionEntry {
  _id?: string;
  gameId: string;
  score: number;
  timestamp: number;
  txHash?: string;
  // Optional: add reward if you want to show it in UI
  // reward?: number;
}

export interface WalletOption {
  name: string;
  installed: boolean;
  downloadUrl: string;
  icon?: string;
  provider?: any;
  isInApp?: boolean;
}

// Internal hook that contains the actual implementation
function useWeb3State() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const [ownedGames, setOwnedGames] = useState<string[]>([]);
  const [history, setHistory] = useState<EmotionEntry[]>([]);
  const [gameSessions, setGameSessions] = useState<GameSessionEntry[]>([]);
  const [chainId, setChainId] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [installedWallets, setInstalledWallets] = useState<WalletOption[]>([]);
  const { toast } = useToast();

  // Detect if running inside MiniPay in-app browser
  const isMiniPayInApp = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      userAgent.includes('minipay') ||
      (typeof window.ethereum !== 'undefined' && window.ethereum.isMiniPay === true)
    );
  }, []);

  // Check for all installed EVM wallets
  useEffect(() => {
    const detectWallets = () => {
      const wallets: WalletOption[] = [];

      // Check if running in MiniPay in-app browser
      if (isMiniPayInApp()) {
        wallets.push({
          name: 'MiniPay',
          installed: true,
          downloadUrl: 'https://minipay.celo.org/',
          provider: window.ethereum,
          isInApp: true,
        });
        // If in MiniPay, only show MiniPay option
        setInstalledWallets(wallets);
        return;
      }

      // Standard EVM wallet detection for regular browsers
      const walletChecks = [
        {
          name: 'MetaMask',
          check: () => window.ethereum?.isMetaMask && !window.ethereum?.isBraveWallet,
          provider: () => window.ethereum,
          downloadUrl: 'https://metamask.io/download/',
        },
        {
          name: 'Coinbase Wallet',
          check: () => window.ethereum?.isCoinbaseWallet || window.coinbaseWalletExtension,
          provider: () => window.coinbaseWalletExtension || window.ethereum,
          downloadUrl: 'https://www.coinbase.com/wallet/downloads',
        },
        {
          name: 'Trust Wallet',
          check: () => window.ethereum?.isTrust || window.trustwallet,
          provider: () => window.trustwallet || window.ethereum,
          downloadUrl: 'https://trustwallet.com/download',
        },
        {
          name: 'Brave Wallet',
          check: () => window.ethereum?.isBraveWallet || window.brave,
          provider: () => window.brave || window.ethereum,
          downloadUrl: 'https://brave.com/wallet/',
        },
        {
          name: 'Rabby Wallet',
          check: () => window.ethereum?.isRabby || window.rabby,
          provider: () => window.rabby || window.ethereum,
          downloadUrl: 'https://rabby.io/',
        },
        {
          name: 'OKX Wallet',
          check: () => window.okxwallet,
          provider: () => window.okxwallet,
          downloadUrl: 'https://www.okx.com/web3',
        },
        {
          name: 'Phantom',
          check: () => window.phantom?.ethereum,
          provider: () => window.phantom?.ethereum,
          downloadUrl: 'https://phantom.app/download',
        },
        {
          name: 'BitKeep',
          check: () => window.bitkeep?.ethereum || window.ethereum?.isBitKeep,
          provider: () => window.bitkeep?.ethereum || window.ethereum,
          downloadUrl: 'https://bitkeep.com/download',
        },
      ];

      // Check each wallet
      walletChecks.forEach(({ name, check, provider, downloadUrl }) => {
        const installed = check();
        wallets.push({
          name,
          installed: !!installed,
          downloadUrl,
          provider: installed ? provider() : undefined,
          isInApp: false,
        });
      });

      // If window.ethereum exists but no specific wallet was detected, add generic option
      if (window.ethereum && !wallets.some((w) => w.installed)) {
        wallets.unshift({
          name: 'Injected Wallet',
          installed: true,
          downloadUrl: '',
          provider: window.ethereum,
          isInApp: false,
        });
      }

      setInstalledWallets(wallets);
    };

    // Initial detection
    detectWallets();

    // Re-check after a short delay (some wallets inject asynchronously)
    const timer = setTimeout(detectWallets, 1000);

    return () => clearTimeout(timer);
  }, [isMiniPayInApp]);

  // Load persisted connection state
  useEffect(() => {
    const savedAddress = localStorage.getItem('feelspace_wallet_address');
    const savedIsConnected = localStorage.getItem('feelspace_is_connected');
    const savedHistory = localStorage.getItem('feelspace_history');
    const savedBalances = localStorage.getItem('feelspace_balances');
    const savedGames = localStorage.getItem('feelspace_games');

    if (savedAddress && savedIsConnected === 'true') {
      setAddress(savedAddress);
      setIsConnected(true);
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to parse history:', e);
        }
      }
      if (savedBalances) {
        try {
          setBalances(JSON.parse(savedBalances));
        } catch (e) {
          console.error('Failed to parse balances:', e);
        }
      }
      if (savedGames) {
        try {
          setOwnedGames(JSON.parse(savedGames));
        } catch (e) {
          console.error('Failed to parse games:', e);
        }
      }
    }
  }, []);

  // Save connection state to localStorage
  const saveToLocalStorage = useCallback(
    (
      connectedAddress: string,
      connectedHistory: EmotionEntry[],
      connectedBalances: { [key: string]: number },
      connectedGames: string[]
    ) => {
      localStorage.setItem('feelspace_wallet_address', connectedAddress);
      localStorage.setItem('feelspace_is_connected', 'true');
      localStorage.setItem('feelspace_history', JSON.stringify(connectedHistory));
      localStorage.setItem('feelspace_balances', JSON.stringify(connectedBalances));
      localStorage.setItem('feelspace_games', JSON.stringify(connectedGames));
    },
    []
  );

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('feelspace_wallet_address');
    localStorage.removeItem('feelspace_is_connected');
    localStorage.removeItem('feelspace_history');
    localStorage.removeItem('feelspace_balances');
    localStorage.removeItem('feelspace_games');
  }, []);

  // Auto-cleanup on window close/browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear localStorage when browser/window closes
      clearLocalStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [clearLocalStorage]);

  const connect = useCallback(
    async (walletName?: string) => {
      try {
        console.log('Starting wallet connection with wallet:', walletName);

        // 1. Pick provider
        let provider: any;

        if (walletName) {
          const selectedWallet = installedWallets.find((w) => w.name === walletName);
          if (selectedWallet?.provider) {
            provider = selectedWallet.provider;
            console.log(`Using ${walletName} provider`);
          }
        }

        if (!provider) {
          provider = window.ethereum;
        }

        if (!provider) {
          console.warn('No ethereum provider found');
          toast({
            title: 'No Wallet Found',
            description: 'Please install a Web3 wallet to continue.',
            variant: 'destructive',
          });
          setShowWalletModal(true);
          return;
        }

        console.log('Provider found:', provider);

        // 2. Request accounts
        console.log('Requesting accounts...');
        const accounts = await provider.request({ method: 'eth_requestAccounts' });

        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts returned from provider');
        }

        const account = accounts[0];
        console.log('Account received:', account);

        setAddress(account);
        setIsConnected(true);

        // 3. Read current chain
        let chainId = await provider.request({ method: 'eth_chainId' });
        console.log('Current chainId:', chainId);
        setChainId(chainId);

        // 4. Ensure we are on Celo Sepolia BEFORE touching the contract
        if (chainId !== '0xaa044c') {
          try {
            console.log('Attempting to switch to Celo Sepolia...');
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa044c' }],
            });
            console.log('Successfully switched to Celo Sepolia');
          } catch (switchError: any) {
            console.warn('Chain switch error:', switchError.code, switchError.message);
            if (switchError.code === 4902) {
              try {
                console.log('Adding Celo Sepolia chain...');
                await provider.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0xaa044c',
                      chainName: 'Celo Sepolia Testnet',
                      nativeCurrency: {
                        name: 'CELO',
                        symbol: 'CELO',
                        decimals: 18,
                      },
                      rpcUrls: ['https://forno.celo-sepolia.celo-testnet.org'],
                      blockExplorerUrls: ['https://celo-sepolia.blockscout.com'],
                    },
                  ],
                });
                console.log('Successfully added Celo Sepolia chain');
              } catch (addError) {
                console.error('Failed to add Celo Sepolia', addError);
                throw addError;
              }
            } else if (switchError.code === 4001) {
              console.log('User rejected chain switch');
              clearLocalStorage();
              throw switchError;
            } else {
              throw switchError;
            }
          }

          // Refresh chainId after switching
          chainId = await provider.request({ method: 'eth_chainId' });
          console.log('New chainId:', chainId);
          setChainId(chainId);
        }

        // 5. Basic native balance (CELO)
        const balanceHex = await provider.request({
          method: 'eth_getBalance',
          params: [account, 'latest'],
        });
        const balanceEth = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
        setBalance(balanceEth);

        // 6. Initialize contract on the correct chain
        await web3Service.initialize();

        // 7. Load FEELS balance
        const feelsBalanceStr = await web3Service.getUserFeelsBalance(account);
        const feelsBalance = Number(feelsBalanceStr);

        // 8. Fetch on-chain emotion history
        const chainHistory = await web3Service.getUserHistory(account);

        // 9. Fetch EmotionLogged events to hydrate tx hashes
        const emotionEvents = await web3Service.getUserEmotionEvents(account);
        const txHashMap = new Map<string, string>();

        for (const ev of emotionEvents) {
          const user = ev.args?.user as string | undefined;
          const emotionType = ev.args?.emotionType as string | undefined;
          const ts = ev.args?.timestamp as bigint | number | undefined;

          if (!user || !emotionType || ts === undefined) continue;

          const tsSec = typeof ts === 'bigint' ? Number(ts) : Number(ts);
          const key = `${user.toLowerCase()}-${tsSec}-${emotionType}`;
          txHashMap.set(key, ev.transactionHash);
        }

        // 10. Fetch game sessions
        const chainGameSessions = await web3Service.getUserGameSessions(account);
        const formattedGameSessions: GameSessionEntry[] = (chainGameSessions || []).map(
          (session: any) => {
            const tsSecRaw = session.timestamp as bigint | number;
            const tsSec =
              typeof tsSecRaw === 'bigint' ? Number(tsSecRaw) : Number(tsSecRaw);

            return {
              timestamp: tsSec * 1000,
              gameId: session.gameId,
              score: Number(session.score),
              txHash: undefined,
            };
          }
        );

        // 11. Format history for UI
        const formattedHistory: EmotionEntry[] = (chainHistory || []).map(
          (entry: any) => {
            const tsSecRaw = entry.timestamp as bigint | number;
            const tsSec =
              typeof tsSecRaw === 'bigint' ? Number(tsSecRaw) : Number(tsSecRaw);

            const emotionType = entry.emotionType as string;
            const key = `${account.toLowerCase()}-${tsSec}-${emotionType}`;
            const txHash = txHashMap.get(key);

            return {
              timestamp: tsSec * 1000,
              emotion: emotionType,
              intensity: Number(entry.intensity),
              notes: entry.notes,
              earned: 10,
              txHash,
            };
          }
        );

        const newBalances = { FEELS: feelsBalance };
        const newGames: string[] = [];

        setBalances(newBalances);
        setOwnedGames(newGames);
        setHistory(formattedHistory);
        setGameSessions(formattedGameSessions);

        // 12. Persist locally
        saveToLocalStorage(account, formattedHistory, newBalances, newGames);

        setShowWalletModal(false);
        toast({
          title: 'Wallet Connected',
          description: `Connected with ${walletName || 'wallet'} successfully.`,
        });
      } catch (error: any) {
        console.error('Error connecting wallet:', error);
        console.error('Error code:', error?.code);
        console.error('Error message:', error?.message);

        if (error.code === 4001) {
          toast({
            title: 'Connection Cancelled',
            description: 'You cancelled the wallet connection.',
          });
        } else if (
          error.code === -32603 ||
          error.message?.includes('Internal JSON-RPC error')
        ) {
          toast({
            title: 'Connection Failed',
            description:
              'Wallet error. Try using a different wallet or check your connection.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Connection Failed',
            description:
              error?.message || 'Could not connect to wallet. Please try again.',
            variant: 'destructive',
          });
        }
      }
    },
    [toast, saveToLocalStorage, clearLocalStorage, installedWallets]
  );

  const disconnect = useCallback(
    () => {
      setAddress(null);
      setIsConnected(false);
      setBalance('0');
      setBalances({});
      setOwnedGames([]);
      setHistory([]);
      setGameSessions([]);
      setChainId(null);
      setShowWalletModal(false);

      // Clear all localStorage items
      clearLocalStorage();

      // Also clear any wallet-specific storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('feelspace_') || key.startsWith('wallet')) {
          localStorage.removeItem(key);
        }
      });

      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected and all data cleared.',
      });
    },
    [clearLocalStorage, toast]
  );

  const buyGame = useCallback(
    async (gameId: string) => {
      try {
        await web3Service.initialize();
        const { txHash, receipt } = await web3Service.buyGame(gameId);

        setOwnedGames((prev) => [...prev, gameId]);
        // Optional: you can refresh on-chain FEELS here if purchase burns tokens

        toast({
          title: 'Game Purchased',
          description: 'Your game purchase has been recorded on the blockchain.',
        });

        return true;
      } catch (error: any) {
        console.error('Error buying game:', error);
        toast({
          title: 'Purchase Failed',
          description: error?.message || 'Failed to purchase game on blockchain.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  const recordGameSession = useCallback(
    async (gameId: string, score: number) => {
      try {
        await web3Service.initialize();
        const { txHash, receipt } = await web3Service.completeGame(gameId, score);

        const newSession: GameSessionEntry = {
          gameId,
          score,
          timestamp: Date.now(),
          txHash,
        };

        try {
          if (address) {
            const response = await fetch('http://localhost:5500/api/games/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                walletAddress: address,
                gameId,
                score,
                txHash,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to record game session to database');
            }

            const dbEntry = await response.json();
            newSession._id = dbEntry.data._id;
            newSession.timestamp = new Date(dbEntry.data.timestamp).getTime();
            newSession.txHash = dbEntry.data.txHash;
          }
        } catch (error) {
          console.error('Error recording game session to database:', error);
        }

        const newSessions = [newSession, ...gameSessions];
        setGameSessions(newSessions);

        // Reward is already calculated and applied on-chain; just refresh FEELS from contract
        if (address) {
          const feelsBalanceStr = await web3Service.getUserFeelsBalance(address);
          const feelsBalance = Number(feelsBalanceStr);
          const updatedBalances = { ...balances, FEELS: feelsBalance };
          setBalances(updatedBalances);
          saveToLocalStorage(address, history, updatedBalances, ownedGames);
          localStorage.setItem('feelspace_games', JSON.stringify(ownedGames));
        }

        toast({
          title: 'Game Completed',
          description: 'Your game session has been recorded on the blockchain.',
        });
      } catch (error: any) {
        console.error('Error recording game session:', error);
        toast({
          title: 'Transaction Failed',
          description:
            error?.message || 'Failed to record game session on blockchain.',
          variant: 'destructive',
        });
      }
    },
    [gameSessions, address, balances, ownedGames, history, saveToLocalStorage, toast]
  );

  const logEmotion = useCallback(
    async (emotion: string, intensity: number, notes: string) => {
      const reward = 10;

      try {
        await web3Service.initialize();
        const { txHash, receipt } = await web3Service.logEmotion(
          emotion,
          intensity,
          notes
        );

        const newEntry: EmotionEntry = {
          timestamp: Date.now(),
          emotion,
          intensity,
          notes,
          earned: reward,
          txHash,
        };

        try {
          if (address) {
            const response = await fetch('http://localhost:5500/api/emotions/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                walletAddress: address,
                emotion,
                intensity,
                notes,
                earned: reward,
                txHash,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to log emotion to database');
            }

            const dbEntry = await response.json();
            newEntry._id = dbEntry.data._id;
            newEntry.timestamp = new Date(dbEntry.data.timestamp).getTime();
            newEntry.txHash = dbEntry.data.txHash;
          }
        } catch (error) {
          console.error('Error logging emotion to database:', error);
        }

        const newHistory = [newEntry, ...history];

        // On-chain logEmotion already minted 10 FEELS; refresh from contract instead of manual math
        let newBalances = { ...balances };
        if (address) {
          const feelsBalanceStr = await web3Service.getUserFeelsBalance(address);
          const feelsBalance = Number(feelsBalanceStr);
          newBalances = { ...newBalances, FEELS: feelsBalance };
        }

        setHistory(newHistory);
        setBalances(newBalances);

        if (address) {
          saveToLocalStorage(address, newHistory, newBalances, ownedGames);
        }

        toast({
          title: 'Emotion Logged',
          description: 'Your emotion has been recorded on the blockchain.',
        });
      } catch (error: any) {
        console.error('Error logging emotion:', error);
        toast({
          title: 'Transaction Failed',
          description: error?.message || 'Failed to log emotion on blockchain.',
          variant: 'destructive',
        });
      }
    },
    [history, balances, address, ownedGames, saveToLocalStorage, toast]
  );

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          disconnect();
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(chainId);
        window.location.reload();
      });
    }
  }, [disconnect]);

  return {
    address,
    isConnected,
    balance,
    balances,
    ownedGames,
    history,
    chainId,
    connect,
    disconnect,
    buyGame,
    logEmotion,
    recordGameSession,
    gameSessions,
    showWalletModal,
    setShowWalletModal,
    installedWallets,
  };
}

// Create a context so the state can be shared across the app
const Web3Context = createContext<ReturnType<typeof useWeb3State> | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const web3 = useWeb3State();
  return React.createElement(Web3Context.Provider, { value: web3 }, children);
}

// Public hook consumers use this - reads from context
export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) {
    return useWeb3State();
  }
  return ctx;
}
