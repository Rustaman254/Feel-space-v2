import React from 'react';
import { motion } from 'framer-motion';
import { Download, X, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WalletOption } from '@/hooks/use-web3';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  installedWallets: WalletOption[];
  onSelectWallet: (walletName: string) => void;
}

export function WalletModal({ isOpen, onClose, installedWallets, onSelectWallet }: WalletModalProps) {
  if (!isOpen) return null;

  const installedCount = installedWallets.filter(w => w.installed).length;
  const uninstalledWallets = installedWallets.filter(w => !w.installed);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border-2 border-black rounded-xl shadow-flat max-w-md w-full"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-2 border-black">
          <h2 className="text-2xl font-heading font-black text-black">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded border border-transparent hover:border-black transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Installed Wallets */}
          {installedCount > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Available Wallets</p>
              {installedWallets.map(wallet => (
                wallet.installed && (
                  <button
                    key={wallet.name}
                    onClick={() => onSelectWallet(wallet.name)}
                    className="w-full p-4 border-2 border-black rounded-lg bg-accent hover:bg-accent/80 transition-all shadow-flat-sm hover:shadow-none hover:translate-y-[2px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black">{wallet.name}</span>
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-black" />
                    </div>
                  </button>
                )
              ))}
            </div>
          )}

          {/* Uninstalled Wallets */}
          {uninstalledWallets.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Install a Wallet</p>
              {uninstalledWallets.map(wallet => (
                <a
                  key={wallet.name}
                  href={wallet.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-black hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-slate-500" />
                      <span className="font-bold text-slate-700">{wallet.name}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Coming Soon Section */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4 space-y-2">
            <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Coming Soon</p>
            <p className="text-xs font-medium text-slate-500">Server-side wallets and other payment methods will be available soon.</p>
          </div>

          {/* Info */}
          <p className="text-xs text-slate-400 text-center font-bold">
            We support all EVM wallets on Celo Alfajores Testnet
          </p>
        </div>
      </motion.div>
    </div>
  );
}
