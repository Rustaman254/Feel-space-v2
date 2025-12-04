import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
  useConnectors,
} from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { web3Service } from '@/lib/web3';
import { isMiniPayInApp, isFarcasterInApp, CHAIN_IDS } from '@/config/wagmi';
import type { EventLog } from 'ethers';

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
  // Wagmi hooks
  const { address, isConnected: wagmiIsConnected } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balanceData } = useBalance({
    address: address,
  });

  // Local state
  const [balance, setBalance] = useState<string>('0');
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const [ownedGames, setOwnedGames] = useState<string[]>([]);
  const [history, setHistory] = useState<EmotionEntry[]>([]);
  const [gameSessions, setGameSessions] = useState<GameSessionEntry[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [installedWallets, setInstalledWallets] = useState<WalletOption[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Update balance when balanceData changes
  useEffect(() => {
    if (balanceData) {
      setBalance(balanceData.formatted);
    }
  }, [balanceData]);

  // Update connection state
  useEffect(() => {
    setIsConnected(wagmiIsConnected);
  }, [wagmiIsConnected]);

  // Detect installed wallets from Wagmi connectors
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
        setInstalledWallets(wallets);
        return;
      }

      // Check if running in Farcaster
      if (isFarcasterInApp()) {
        wallets.push({
          name: 'Farcaster Wallet',
          installed: true,
          downloadUrl: '',
          provider: window.ethereum,
          isInApp: true,
        });
        setInstalledWallets(wallets);
        return;
      }

      // Map Wagmi connectors to wallet options
      connectors.forEach((connector) => {
        const isReady = typeof connector.ready === 'boolean' ? connector.ready : true;

        wallets.push({
          name: connector.name,
          installed: isReady,
          downloadUrl: getDownloadUrl(connector.name),
          provider: connector,
          isInApp: false,
        });
      });

      setInstalledWallets(wallets);
    };

    detectWallets();
  }, [connectors]);

  // Helper to get download URL for wallet
  const getDownloadUrl = (walletName: string): string => {
    const urls: { [key: string]: string } = {
      'MetaMask': 'https://metamask.io/download/',
      'Coinbase Wallet': 'https://www.coinbase.com/wallet/downloads',
      'WalletConnect': 'https://walletconnect.com/',
      'Trust Wallet': 'https://trustwallet.com/download',
      'Brave Wallet': 'https://brave.com/wallet/',
      'Rabby Wallet': 'https://rabby.io/',
      'OKX Wallet': 'https://www.okx.com/web3',
      'Phantom': 'https://phantom.app/download',
      'BitKeep': 'https://bitkeep.com/download',
    };
    return urls[walletName] || '';
  };

  // Load persisted connection state
  useEffect(() => {
    const savedHistory = localStorage.getItem('feelspace_history');
    const savedBalances = localStorage.getItem('feelspace_balances');
    const savedGames = localStorage.getItem('feelspace_games');

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
  }, []);

  const saveToLocalStorage = useCallback(
    (
      connectedHistory: EmotionEntry[],
      connectedBalances: { [key: string]: number },
      connectedGames: string[]
    ) => {
      localStorage.setItem(
        'feelspace_history',
        JSON.stringify(connectedHistory)
      );
      localStorage.setItem(
        'feelspace_balances',
        JSON.stringify(connectedBalances)
      );
      localStorage.setItem('feelspace_games', JSON.stringify(connectedGames));
    },
    []
  );

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('feelspace_history');
    localStorage.removeItem('feelspace_balances');
    localStorage.removeItem('feelspace_games');
  }, []);

  // Load blockchain data when connected
  useEffect(() => {
    const loadBlockchainData = async () => {
      if (!address || !isConnected) return;

      try {
        await web3Service.initialize();

        // Load FEELS balance
        const feelsBalanceStr = await web3Service.getUserFeelsBalance(address);
        const feelsBalance = Number(feelsBalanceStr);

        // Fetch on-chain emotion history
        const chainHistory = await web3Service.getUserHistory(address);

        // Fetch EmotionLogged events to hydrate tx hashes
        const emotionEvents = await web3Service.getUserEmotionEvents(address);
        const txHashMap = new Map<string, string>();

        for (const ev of emotionEvents) {
          // Type guard to check if event is EventLog
          if (!('args' in ev)) continue;

          const eventLog = ev as EventLog;
          const user = eventLog.args?.user as string | undefined;
          const emotionType = eventLog.args?.emotionType as string | undefined;
          const ts = eventLog.args?.timestamp as bigint | number | undefined;

          if (!user || !emotionType || ts === undefined) continue;

          const tsSec = typeof ts === 'bigint' ? Number(ts) : Number(ts);
          const key = `${user.toLowerCase()}-${tsSec}-${emotionType}`;
          txHashMap.set(key, eventLog.transactionHash);
        }

        // Fetch game sessions
        const chainGameSessions = await web3Service.getUserGameSessions(address);
        const formattedGameSessions: GameSessionEntry[] = (
          chainGameSessions || []
        ).map((session: any) => {
          const tsSecRaw = session.timestamp as bigint | number;
          const tsSec =
            typeof tsSecRaw === 'bigint'
              ? Number(tsSecRaw)
              : Number(tsSecRaw);

          return {
            timestamp: tsSec * 1000,
            gameId: session.gameId,
            score: Number(session.score),
            txHash: undefined,
          };
        });

        // Format history for UI
        const formattedHistory: EmotionEntry[] = (chainHistory || []).map(
          (entry: any) => {
            const tsSecRaw = entry.timestamp as bigint | number;
            const tsSec =
              typeof tsSecRaw === 'bigint'
                ? Number(tsSecRaw)
                : Number(tsSecRaw);

            const emotionType = entry.emotionType as string;
            const key = `${address.toLowerCase()}-${tsSec}-${emotionType}`;
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

        saveToLocalStorage(formattedHistory, newBalances, newGames);
      } catch (error) {
        console.error('Error loading blockchain data:', error);
      }
    };

    loadBlockchainData();
  }, [address, isConnected, saveToLocalStorage]);

  const connect = useCallback(
    async (walletName?: string) => {
      try {
        console.log('Starting wallet connection with wallet:', walletName);

        // Find the connector
        let selectedConnector = connectors[0]; // Default to first connector

        if (walletName) {
          const found = connectors.find((c) => c.name === walletName);
          if (found) {
            selectedConnector = found;
          }
        }

        if (!selectedConnector) {
          toast({
            title: 'No Wallet Found',
            description: 'Please install a Web3 wallet to continue.',
            variant: 'destructive',
          });
          setShowWalletModal(true);
          return;
        }

        // Connect using Wagmi
        wagmiConnect({ connector: selectedConnector });

        setShowWalletModal(false);
        toast({
          title: 'Wallet Connected',
          description: `Connected with ${walletName || 'wallet'} successfully.`,
        });
      } catch (error: any) {
        console.error('Error connecting wallet:', error);

        if (error.code === 4001) {
          toast({
            title: 'Connection Cancelled',
            description: 'You cancelled the wallet connection.',
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
    [connectors, wagmiConnect, toast]
  );

  const disconnect = useCallback(() => {
    wagmiDisconnect();
    setBalance('0');
    setBalances({});
    setOwnedGames([]);
    setHistory([]);
    setGameSessions([]);
    setShowWalletModal(false);

    clearLocalStorage();

    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected and all data cleared.',
    });
  }, [wagmiDisconnect, clearLocalStorage, toast]);

  const buyGame = useCallback(
    async (gameId: string) => {
      try {
        await web3Service.initialize();
        const { txHash, receipt } = await web3Service.buyGame(gameId);

        setOwnedGames((prev) => [...prev, gameId]);

        toast({
          title: 'Game Purchased',
          description: 'Your game purchase has been recorded on the blockchain.',
        });

        return true;
      } catch (error: any) {
        console.error('Error buying game:', error);
        toast({
          title: 'Purchase Failed',
          description:
            error?.message || 'Failed to purchase game on blockchain.',
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
        const { txHash, receipt } = await web3Service.completeGame(
          gameId,
          score
        );

        const newSession: GameSessionEntry = {
          gameId,
          score,
          timestamp: Date.now(),
          txHash,
        };

        try {
          if (address) {
            const response = await fetch(
              'http://localhost:5500/api/games/complete',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  walletAddress: address,
                  gameId,
                  score,
                  txHash,
                }),
              }
            );

            if (!response.ok) {
              throw new Error('Failed to record game session to database');
            }

            const dbEntry = await response.json();
            newSession._id = dbEntry.data._id;
            newSession.timestamp = new Date(
              dbEntry.data.timestamp
            ).getTime();
            newSession.txHash = dbEntry.data.txHash;
          }
        } catch (error) {
          console.error(
            'Error recording game session to database:',
            error
          );
        }

        const newSessions = [newSession, ...gameSessions];
        setGameSessions(newSessions);

        if (address) {
          const feelsBalanceStr = await web3Service.getUserFeelsBalance(
            address
          );
          const feelsBalance = Number(feelsBalanceStr);
          const updatedBalances = { ...balances, FEELS: feelsBalance };
          setBalances(updatedBalances);
          saveToLocalStorage(history, updatedBalances, ownedGames);
        }

        toast({
          title: 'Game Completed',
          description:
            'Your game session has been recorded on the blockchain.',
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
    [
      gameSessions,
      address,
      balances,
      ownedGames,
      history,
      saveToLocalStorage,
      toast,
    ]
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
            const response = await fetch(
              'http://localhost:5500/api/emotions/log',
              {
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
              }
            );

            if (!response.ok) {
              throw new Error('Failed to log emotion to database');
            }

            const dbEntry = await response.json();
            newEntry._id = dbEntry.data._id;
            newEntry.timestamp = new Date(
              dbEntry.data.timestamp
            ).getTime();
            newEntry.txHash = dbEntry.data.txHash;
          }
        } catch (error) {
          console.error('Error logging emotion to database:', error);
        }

        const newHistory = [newEntry, ...history];

        let newBalances = { ...balances };
        if (address) {
          const feelsBalanceStr = await web3Service.getUserFeelsBalance(
            address
          );
          const feelsBalance = Number(feelsBalanceStr);
          newBalances = { ...newBalances, FEELS: feelsBalance };
        }

        setHistory(newHistory);
        setBalances(newBalances);

        if (address) {
          saveToLocalStorage(newHistory, newBalances, ownedGames);
        }

        toast({
          title: 'Emotion Logged',
          description: 'Your emotion has been recorded on the blockchain.',
        });
      } catch (error: any) {
        console.error('Error logging emotion:', error);
        toast({
          title: 'Transaction Failed',
          description:
            error?.message || 'Failed to log emotion on blockchain.',
          variant: 'destructive',
        });
      }
    },
    [history, balances, address, ownedGames, saveToLocalStorage, toast]
  );

  return {
    address: address || null,
    isConnected,
    balance,
    balances,
    ownedGames,
    history,
    chainId: chainId || null,
    connect,
    disconnect,
    buyGame,
    logEmotion,
    recordGameSession,
    gameSessions,
    showWalletModal,
    setShowWalletModal,
    installedWallets,
    switchChain,
  };
}

// Create a context so the state can be shared across the app
const Web3Context = createContext<ReturnType<typeof useWeb3State> | null>(
  null
);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const web3 = useWeb3State();
  return React.createElement(Web3Context.Provider, { value: web3 }, children);
}

// Public hook consumers use this - reads from context
export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return ctx;
}
