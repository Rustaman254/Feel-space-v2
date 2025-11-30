import React from 'react';
import { Link, useLocation } from 'wouter';
import { Wallet, Sparkles, LogOut, History, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useWeb3 } from '@/hooks/use-web3';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { address, isConnected, balance, connect, disconnect } = useWeb3();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground overflow-hidden relative bg-background">
      {/* Navigation */}
      <nav className="w-full px-4 md:px-6 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center z-10 bg-white border-b-2 border-black gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="p-2 bg-accent border-2 border-black rounded-md shadow-flat-sm group-hover:translate-y-1 group-hover:shadow-none transition-all">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tight text-black">CeloMood</span>
            </div>
          </Link>
          
          {/* Mobile Menu Button could go here */}
        </div>

        <div className="flex items-center gap-2 md:gap-6 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-2 md:pb-0">
          {/* Nav Links */}
          <div className="flex items-center gap-2">
             <Link href="/games">
                <Button variant="ghost" className={`font-bold border-2 ${location === '/games' ? 'bg-slate-100 border-black' : 'border-transparent hover:bg-slate-50'}`}>
                  <Gamepad2 className="w-4 h-4 mr-2" /> Arcade
                </Button>
             </Link>
             <Link href="/history">
                <Button variant="ghost" className={`font-bold border-2 ${location === '/history' ? 'bg-slate-100 border-black' : 'border-transparent hover:bg-slate-50'}`}>
                  <History className="w-4 h-4 mr-2" /> History
                </Button>
             </Link>
          </div>

          <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block" />

          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end mr-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Balance</span>
                 <span className="font-mono font-bold text-sm">{balance} CELO</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-black shadow-flat-sm">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-black animate-pulse" />
                <span className="text-sm font-bold text-black font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={disconnect} 
                className="h-9 w-9 border-2 border-black shadow-flat-sm hover:shadow-none hover:translate-y-[2px] transition-all bg-destructive/10 hover:bg-destructive/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connect} 
              className="bg-primary text-white font-bold border-2 border-black shadow-flat hover:shadow-flat-sm hover:translate-y-[2px] transition-all rounded-lg px-4 py-2 h-auto text-sm md:text-base"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 z-10 max-w-5xl w-full">
        {children}
      </main>

      <Toaster />
    </div>
  );
}
