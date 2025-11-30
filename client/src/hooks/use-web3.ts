import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
    metawallet?: any;
  }
}

export interface EmotionEntry {
  timestamp: number;
  emotion: string;
  intensity: number;
  notes: string;
  earned: number;
}

export interface WalletOption {
  name: string;
  installed: boolean;
  downloadUrl: string;
  icon?: string;
}

export function useWeb3() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [balances, setBalances] = useState<{ [key: string]: number }>({}); 
  const [ownedGames, setOwnedGames] = useState<string[]>([]);
  const [history, setHistory] = useState<EmotionEntry[]>([]);
  const [chainId, setChainId] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [installedWallets, setInstalledWallets] = useState<WalletOption[]>([]);
  const { toast } = useToast();

  // Check for installed wallets
  useEffect(() => {
    const wallets: WalletOption[] = [
      {
        name: 'MetaMask',
        installed: typeof window.ethereum !== 'undefined' && !!(window.ethereum?.isMetaMask),
        downloadUrl: 'https://metamask.io/download/',
      },
      {
        name: 'MiniPay',
        installed: typeof window.ethereum !== 'undefined' && !!(window.ethereum?.isMiniPay),
        downloadUrl: 'https://minipay.celo.org/',
      },
    ];
    setInstalledWallets(wallets);
  }, []);

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
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedBalances) setBalances(JSON.parse(savedBalances));
      if (savedGames) setOwnedGames(JSON.parse(savedGames));
    }
  }, []);

  // Save connection state to localStorage
  const saveToLocalStorage = useCallback((connectedAddress: string, connectedHistory: EmotionEntry[], connectedBalances: { [key: string]: number }, connectedGames: string[]) => {
    localStorage.setItem('feelspace_wallet_address', connectedAddress);
    localStorage.setItem('feelspace_is_connected', 'true');
    localStorage.setItem('feelspace_history', JSON.stringify(connectedHistory));
    localStorage.setItem('feelspace_balances', JSON.stringify(connectedBalances));
    localStorage.setItem('feelspace_games', JSON.stringify(connectedGames));
  }, []);

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('feelspace_wallet_address');
    localStorage.removeItem('feelspace_is_connected');
    localStorage.removeItem('feelspace_history');
    localStorage.removeItem('feelspace_balances');
    localStorage.removeItem('feelspace_games');
  }, []);

  const connect = useCallback(async (walletName?: string) => {
    if (typeof window.ethereum === 'undefined') {
      setShowWalletModal(true);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAddress(account);
      setIsConnected(true);
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);

      const balanceHex = await window.ethereum.request({ 
        method: 'eth_getBalance', 
        params: [account, 'latest'] 
      });
      const balanceEth = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
      setBalance(balanceEth);

      // Initialize USER-SPECIFIC data (Mocked for demo)
      const newBalances = { 'FEELS': 0 };
      const newGames = ['bubble', 'memory', 'breathing'];
      const newHistory: EmotionEntry[] = [
        { timestamp: Date.now() - 86400000, emotion: 'anxious', intensity: 6, notes: 'Deadline approaching.', earned: 10 },
        { timestamp: Date.now() - 172800000, emotion: 'sad', intensity: 4, notes: 'Rainy day blues.', earned: 10 },
      ];

      setBalances(newBalances);
      setOwnedGames(newGames);
      setHistory(newHistory);

      // Save to localStorage
      saveToLocalStorage(account, newHistory, newBalances, newGames);

      if (chainId !== '0xaef3') { 
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaef3' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaef3',
                    chainName: 'Celo Alfajores Testnet',
                    nativeCurrency: {
                      name: 'Celo',
                      symbol: 'CELO',
                      decimals: 18,
                    },
                    rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
                    blockExplorerUrls: ['https://alfajores-blockscout.celo-testnet.org/'],
                  },
                ],
              });
            } catch (addError) {
              console.error('Failed to add Celo Alfajores', addError);
            }
          } else if (switchError.code === 4001) {
            // User rejected
            clearLocalStorage();
          }
        }
      }

      setShowWalletModal(false);

    } catch (error: any) {
      if (error.code === 4001) {
        // User rejected the connection
        clearLocalStorage();
        console.log("User cancelled wallet connection");
      } else {
        console.error("Error connecting wallet", error);
        toast({
          title: "Connection Failed",
          description: "Could not connect to wallet. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [toast, saveToLocalStorage, clearLocalStorage]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setBalance('0');
    setBalances({});
    setOwnedGames([]);
    setHistory([]);
    clearLocalStorage();
    setShowWalletModal(false);
  }, [clearLocalStorage]);

  const buyGame = useCallback((gameId: string) => {
    console.log(`Buying game: ${gameId}`);
    setOwnedGames(prev => [...prev, gameId]);
    setBalances(prev => ({ ...prev, 'FEELS': prev['FEELS'] - 50 }));
    return true;
  }, []);

  const logEmotion = useCallback((emotion: string, intensity: number, notes: string) => {
    const reward = 10;
    const newEntry = {
      timestamp: Date.now(),
      emotion,
      intensity,
      notes,
      earned: reward
    };
    const newHistory = [newEntry, ...history];
    const newBalances = { ...balances, 'FEELS': (balances['FEELS'] || 0) + reward };
    
    setHistory(newHistory);
    setBalances(newBalances);
    
    if (address) {
      saveToLocalStorage(address, newHistory, newBalances, ownedGames);
    }
  }, [history, balances, address, ownedGames, saveToLocalStorage]);

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
    showWalletModal,
    setShowWalletModal,
    installedWallets
  };
}
