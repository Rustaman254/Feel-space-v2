import { useState, useEffect } from 'react';

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');

  const connect = async () => {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsConnected(true);
    setAddress('0x71C...9A21');
    setBalance('12.5 CELO');
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance('0');
  };

  return { isConnected, address, balance, connect, disconnect };
}
