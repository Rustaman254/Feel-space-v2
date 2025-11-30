import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface EmotionEntry {
  timestamp: number;
  emotion: string;
  intensity: number;
  notes: string;
  earned: number;
}

export function useWeb3() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [balances, setBalances] = useState<{ [key: string]: number }>({}); 
  const [ownedGames, setOwnedGames] = useState<string[]>([]);
  const [history, setHistory] = useState<EmotionEntry[]>([]);
  const [chainId, setChainId] = useState<string | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
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
        // In a real app, this would be fetched from the smart contract
        setBalances({ 'FEELS': 0 }); 
        setOwnedGames(['bubble', 'memory', 'breathing']);
        setHistory([
           // Mock history for the connected user
           { timestamp: Date.now() - 86400000, emotion: 'anxious', intensity: 6, notes: 'Deadline approaching.', earned: 10 },
           { timestamp: Date.now() - 172800000, emotion: 'sad', intensity: 4, notes: 'Rainy day blues.', earned: 10 },
        ]);

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
               }
             }
        }

      } catch (error) {
        console.error("User denied account access", error);
        toast({
          title: "Connection Failed",
          description: "Could not connect to wallet.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or use MiniPay.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setBalance('0');
    setBalances({}); // Clear balances
    setOwnedGames([]); // Clear games
    setHistory([]); // Clear history
  }, []);

  const buyGame = useCallback((gameId: string) => {
    console.log(`Buying game: ${gameId}`);
    setOwnedGames(prev => [...prev, gameId]);
    setBalances(prev => ({ ...prev, 'FEELS': prev['FEELS'] - 50 })); // Deduct cost
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
    setHistory(prev => [newEntry, ...prev]);
    setBalances(prev => ({ ...prev, 'FEELS': (prev['FEELS'] || 0) + reward }));
  }, []);

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

  return { address, isConnected, balance, balances, ownedGames, history, chainId, connect, disconnect, buyGame, logEmotion };
}
