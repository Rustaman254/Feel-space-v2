import React from 'react';
import { X, Download, ExternalLink, Wallet, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface WalletOption {
  name: string;
  installed: boolean;
  downloadUrl: string;
  icon?: string;
  provider?: any;
  isInApp?: boolean;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  installedWallets: WalletOption[];
  onSelectWallet: (walletName: string) => Promise<void>;
}

export function WalletModal({ 
  isOpen, 
  onClose, 
  installedWallets, 
  onSelectWallet 
}: WalletModalProps) {
  const [connecting, setConnecting] = React.useState<string | null>(null);

  const handleWalletClick = async (wallet: WalletOption) => {
    if (!wallet.installed) {
      window.open(wallet.downloadUrl, '_blank');
      return;
    }

    setConnecting(wallet.name);
    try {
      await onSelectWallet(wallet.name);
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(null);
    }
  };

  const installedCount = installedWallets.filter(w => w.installed).length;
  const hasInstalledWallets = installedCount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-black shadow-flat">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-black">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-sm font-bold text-slate-500">
            {hasInstalledWallets 
              ? `${installedCount} wallet${installedCount > 1 ? 's' : ''} detected. Choose one to connect.`
              : 'No wallets detected. Install one to get started.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Installed Wallets Section */}
          {hasInstalledWallets && (
            <>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Installed Wallets
              </p>
              {installedWallets
                .filter(wallet => wallet.installed)
                .map((wallet) => (
                  <Button
                    key={wallet.name}
                    onClick={() => handleWalletClick(wallet)}
                    disabled={connecting !== null}
                    className="w-full justify-between h-auto py-4 px-4 bg-white hover:bg-slate-50 border-2 border-black shadow-flat-sm hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-black flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-black" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-base">
                          {wallet.name}
                          {wallet.isInApp && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-300">
                              In-App
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-bold">
                          {connecting === wallet.name ? 'Connecting...' : 'Ready to connect'}
                        </div>
                      </div>
                    </div>
                    {connecting === wallet.name ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </Button>
                ))}
            </>
          )}

          {/* Available Wallets to Install Section */}
          {installedWallets.filter(w => !w.installed).length > 0 && (
            <>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mt-6">
                Available Wallets
              </p>
              {installedWallets
                .filter(wallet => !wallet.installed)
                .map((wallet) => (
                  <Button
                    key={wallet.name}
                    onClick={() => handleWalletClick(wallet)}
                    className="w-full justify-between h-auto py-4 px-4 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-black transition-all"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-base text-slate-700">
                          {wallet.name}
                        </div>
                        <div className="text-xs text-slate-500 font-bold">
                          Not installed
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Download className="w-4 h-4" />
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </Button>
                ))}
            </>
          )}

          {!hasInstalledWallets && installedWallets.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-600">
                No wallet providers detected. Please install MetaMask or another Web3 wallet.
              </p>
              <Button
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
                className="bg-primary text-white font-bold border-2 border-black shadow-flat-sm"
              >
                Download MetaMask
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-xs text-center text-slate-400 font-bold">
            We support all EVM wallets on Celo Alfajores Testnet
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}