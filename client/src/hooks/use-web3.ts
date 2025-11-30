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
  const [chainId, setChainId] = useState<string | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAddress(account);
        setIsConnected(true);
        
        // Get Chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(chainId);

        // Get Balance
        const balanceHex = await window.ethereum.request({ 
          method: 'eth_getBalance', 
          params: [account, 'latest'] 
        });
        const balanceEth = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
        setBalance(balanceEth);

        // Switch to Celo Alfajores if not connected
        if (chainId !== '0xaef3') { // 44787 in hex
             try {
               await window.ethereum.request({
                 method: 'wallet_switchEthereumChain',
                 params: [{ chainId: '0xaef3' }],
               });
             } catch (switchError: any) {
               // This error code indicates that the chain has not been added to MetaMask.
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
  }, []);

  // Listen for account changes
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

  return { address, isConnected, balance, chainId, connect, disconnect };
}
