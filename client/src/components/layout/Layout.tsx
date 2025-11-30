import React from 'react';
import { Link } from 'wouter';
import { Wallet, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useWeb3 } from '@/hooks/use-web3';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { address, isConnected, balance, connect, disconnect } = useWeb3();

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground overflow-hidden relative">
      {/* Navigation */}
      <nav className="w-full px-6 py-6 flex justify-between items-center z-10 bg-white border-b-2 border-black">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="p-2 bg-accent border-2 border-black rounded-md shadow-flat-sm group-hover:translate-y-1 group-hover:shadow-none transition-all">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-black">CeloMood</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-2">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</span>
                 <span className="font-mono font-bold">{balance} CELO</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-black shadow-flat-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full border border-black" />
                <span className="text-sm font-bold text-black font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={disconnect} 
                className="border-2 border-black shadow-flat-sm hover:shadow-none hover:translate-y-[2px] transition-all bg-destructive/10 hover:bg-destructive/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connect} 
              className="bg-primary text-white font-bold border-2 border-black shadow-flat hover:shadow-flat-sm hover:translate-y-[2px] transition-all rounded-lg px-6"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 z-10 max-w-5xl">
        {children}
      </main>

      <Toaster />
    </div>
  );
}
