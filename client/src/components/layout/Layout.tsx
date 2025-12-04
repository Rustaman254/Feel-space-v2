import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Wallet, Sparkles, LogOut, History, Gamepad2, Home, Zap, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useWeb3 } from '@/hooks/use-web3';
import { WalletModal } from '@/components/WalletModal';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const {
    address,
    isConnected,
    balances,
    disconnect,
    showWalletModal,
    setShowWalletModal,
    installedWallets,
    connect,
  } = useWeb3();
  const [location, setLocation] = useLocation();

  // Redirect to home on logout
  useEffect(() => {
    if (!isConnected && location !== '/') {
      setLocation('/');
    }
  }, [isConnected, location, setLocation]);

  const handleConnectClick = () => {
    setShowWalletModal(true);
  };

  const handleDisconnect = async () => {
    if (
      window.confirm(
        'Are you sure you want to disconnect your wallet? All local data will be cleared.'
      )
    ) {
      disconnect();
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground overflow-hidden relative bg-background pb-24 md:pb-0">
      {/* Desktop Navigation */}
      <nav className="w-full px-4 md:px-6 py-4 md:py-6 hidden md:flex justify-between items-center z-10 bg-white gap-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="p-2 bg-accent border-2 border-black rounded-md shadow-flat-sm group-hover:translate-y-1 group-hover:shadow-none transition-all">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-black">
              Feel Space
            </span>
          </div>
        </Link>

        <div className="flex-1" />

        {isConnected ? (
          <div className="flex items-center gap-3">
            {/* Nav Links - Only show when connected */}
            <div className="flex items-center gap-2">
              <Link href="/games">
                <Button
                  variant="ghost"
                  className={`font-bold border-2 ${location === '/games'
                    ? 'bg-accent/30 border-black text-black'
                    : 'border-transparent hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <Gamepad2 className="w-4 h-4 mr-2" /> Arcade
                </Button>
              </Link>
              <Link href="/sessions">
                <Button
                  variant="ghost"
                  className={`font-bold border-2 ${location === '/sessions'
                    ? 'bg-accent/30 border-black text-black'
                    : 'border-transparent hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <Zap className="w-4 h-4 mr-2" /> Sessions
                </Button>
              </Link>
              <Link href="/history">
                <Button
                  variant="ghost"
                  className={`font-bold border-2 ${location === '/history'
                    ? 'bg-accent/30 border-black text-black'
                    : 'border-transparent hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <History className="w-4 h-4 mr-2" /> History
                </Button>
              </Link>
              <Link href="/insights">
                <Button
                  variant="ghost"
                  className={`font-bold border-2 ${location === '/insights'
                    ? 'bg-accent/30 border-black text-black'
                    : 'border-transparent hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" /> Insights
                </Button>
              </Link>
              <Link href="/community">
                <Button
                  variant="ghost"
                  className={`font-bold border-2 ${location === '/community'
                    ? 'bg-accent/30 border-black text-black'
                    : 'border-transparent hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <Users className="w-4 h-4 mr-2" /> Community
                </Button>
              </Link>
            </div>

            <div className="w-px h-8 bg-slate-200" />

            <div className="flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                FEELS
              </span>
              <span className="font-mono font-bold text-lg text-accent-foreground">
                {balances['FEELS'] || 0}
              </span>
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
              onClick={handleDisconnect}
              className="h-9 w-9 border-2 border-black shadow-flat-sm hover:shadow-none hover:translate-y-[2px] transition-all bg-destructive/10 hover:bg-destructive/20"
              title="Disconnect Wallet"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnectClick}
            className="bg-primary text-white font-bold border-2 border-black shadow-flat hover:shadow-flat-sm hover:translate-y-[2px] transition-all rounded-lg px-4 py-2"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </nav>

      {/* Mobile Header (Logo + Wallet) */}
      <nav className="md:hidden w-full px-4 py-4 flex justify-between items-center bg-white sticky top-0 z-20">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary fill-current" />
            <span className="font-heading font-black text-xl tracking-tight text-black">
              Feel Space
            </span>
          </div>
        </Link>

        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end mr-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                FEELS
              </span>
              <span className="font-mono font-bold text-sm leading-none">
                {balances['FEELS'] || 0}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDisconnect}
              className="h-8 w-8 border-2 border-black rounded-md"
              title="Disconnect Wallet"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnectClick}
            size="sm"
            className="bg-primary text-white font-bold border-2 border-black shadow-flat-sm text-xs px-3"
          >
            <Wallet className="w-3 h-3 mr-1" />
            Connect
          </Button>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 z-10 max-w-5xl w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isConnected && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white border-2 border-black rounded-xl shadow-flat z-50 flex justify-between items-center p-2 overflow-x-auto">
          <Link href="/">
            <div
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors whitespace-nowrap ${location === '/' ? 'bg-accent/30 text-black' : 'text-slate-400'
                }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase">Home</span>
            </div>
          </Link>
          <Link href="/games">
            <div
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors whitespace-nowrap ${location === '/games' ? 'bg-accent/30 text-black' : 'text-slate-400'
                }`}
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase">Arcade</span>
            </div>
          </Link>
          <Link href="/sessions">
            <div
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors whitespace-nowrap ${location === '/sessions' ? 'bg-accent/30 text-black' : 'text-slate-400'
                }`}
            >
              <Zap className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase">Session</span>
            </div>
          </Link>
          <Link href="/history">
            <div
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors whitespace-nowrap ${location === '/history' ? 'bg-accent/30 text-black' : 'text-slate-400'
                }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase">History</span>
            </div>
          </Link>
          <Link href="/insights">
            <div
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors whitespace-nowrap ${location === '/insights' ? 'bg-accent/30 text-black' : 'text-slate-400'
                }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase">Insights</span>
            </div>
          </Link>
          <Link href="/community">
            <div
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors whitespace-nowrap ${location === '/community' ? 'bg-accent/30 text-black' : 'text-slate-400'
                }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase">Community</span>
            </div>
          </Link>
        </div>
      )}

      {/* Shared wallet modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        installedWallets={installedWallets}
        onSelectWallet={connect}
      />

      <Toaster />
    </div>
  );
}
