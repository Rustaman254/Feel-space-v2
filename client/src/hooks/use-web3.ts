import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWeb3() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [balances, setBalances] = useState<{ [key: string]: number }>({}); // Mock balances for demo
  const [ownedGames, setOwnedGames] = useState<string[]>([]); // Mock owned games
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

        // Initialize mock game data for demo purposes
        setBalances({ 'FEELS': 120 });
        setOwnedGames(['bubble', 'memory', 'breathing']);

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
    setBalances({});
    setOwnedGames([]);
  }, []);

  // Mock function to simulate buying a game
  const buyGame = useCallback((gameId: string) => {
    // This would interact with the smart contract in a real app
    console.log(`Buying game: ${gameId}`);
    // Simulate success
    setOwnedGames(prev => [...prev, gameId]);
    return true;
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

  return { address, isConnected, balance, balances, ownedGames, chainId, connect, disconnect, buyGame };
}
