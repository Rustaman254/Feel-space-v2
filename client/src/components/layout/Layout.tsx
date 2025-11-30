import React from 'react';
import { Link } from 'wouter';
import { Wallet, Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isConnected, address, connect, disconnect } = useWallet();

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground overflow-hidden relative">
      {/* Background Elements */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-400/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-teal-400/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex justify-between items-center z-10 glass sticky top-0">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-slate-800">CeloMood</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-white/40 shadow-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-700 font-mono">{address}</span>
              <Button variant="ghost" size="sm" onClick={disconnect} className="h-auto p-1 ml-2 text-xs text-slate-500 hover:text-destructive">
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connect} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-full px-6">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 z-10 max-w-5xl">
        {children}
      </main>

      <Toaster />
    </div>
  );
}
