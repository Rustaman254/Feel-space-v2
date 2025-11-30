import React from 'react';
import { Link, useLocation } from 'wouter';
import { Wallet, Sparkles, LogOut, History, Gamepad2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useWeb3 } from '@/hooks/use-web3';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { address, isConnected, balances, connect, disconnect } = useWeb3();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground overflow-hidden relative bg-background pb-24 md:pb-0">
      {/* Desktop Navigation */}
      <nav className="w-full px-4 md:px-6 py-4 md:py-6 hidden md:flex justify-between items-center z-10 bg-white gap-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="p-2 bg-accent border-2 border-black rounded-md shadow-flat-sm group-hover:translate-y-1 group-hover:shadow-none transition-all">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-black">Feel Space</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
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

          <div className="w-px h-8 bg-slate-200" />

          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end mr-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">FEELS</span>
                 <span className="font-mono font-bold text-lg text-accent-foreground">{balances['FEELS'] || 0}</span>
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
              onClick={() => connect()} 
              className="bg-primary text-white font-bold border-2 border-black shadow-flat hover:shadow-flat-sm hover:translate-y-[2px] transition-all rounded-lg px-4 py-2"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile Header (Logo + Wallet) */}
      <nav className="md:hidden w-full px-4 py-4 flex justify-between items-center bg-white sticky top-0 z-20">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary fill-current" />
            <span className="font-heading font-black text-xl tracking-tight text-black">Feel Space</span>
          </div>
        </Link>
        
        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end mr-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">FEELS</span>
              <span className="font-mono font-bold text-sm leading-none">{balances['FEELS'] || 0}</span>
            </div>
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={disconnect} 
                className="h-8 w-8 border-2 border-black rounded-md"
              >
                <LogOut className="w-4 h-4" />
              </Button>
          </div>
        ) : (
          <Button 
              onClick={() => connect()} 
              size="sm"
              className="bg-primary text-white font-bold border-2 border-black shadow-flat-sm text-xs px-3"
            >
              Connect
            </Button>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 z-10 max-w-5xl w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white border-2 border-black rounded-xl shadow-flat z-50 flex justify-around items-center p-2">
        <Link href="/">
          <div className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${location === '/' ? 'bg-accent/20 text-black' : 'text-slate-400'}`}>
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase">Home</span>
          </div>
        </Link>
        <Link href="/games">
          <div className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${location === '/games' ? 'bg-accent/20 text-black' : 'text-slate-400'}`}>
            <Gamepad2 className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase">Arcade</span>
          </div>
        </Link>
        <Link href="/history">
          <div className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${location === '/history' ? 'bg-accent/20 text-black' : 'text-slate-400'}`}>
            <History className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase">History</span>
          </div>
        </Link>
      </div>

      <Toaster />
    </div>
  );
}
