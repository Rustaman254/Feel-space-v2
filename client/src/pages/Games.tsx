import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile, Zap, CloudRain, Frown, Lock, CheckCircle, Coins, Gamepad2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useWeb3 } from '@/hooks/use-web3';

const GAMES = [
  {
    id: 'bubble',
    title: 'Bubble Pop',
    description: 'Pop stress away with this satisfying physics game.',
    price: 0,
    isFree: true,
    icon: Zap,
    color: 'bg-primary text-white'
  },
  {
    id: 'memory',
    title: 'Mind Match',
    description: 'Sharpen your focus by finding matching pairs.',
    price: 0,
    isFree: true,
    icon: Smile,
    color: 'bg-secondary text-white'
  },
  {
    id: 'breathing',
    title: 'Box Breathing',
    description: 'Simple visual guide for deep breathing.',
    price: 0,
    isFree: true,
    icon: CloudRain,
    color: 'bg-accent text-black'
  },
  {
    id: 'journal',
    title: 'Mood Journal',
    description: 'Deep dive into your feelings with guided prompts.',
    price: 50,
    isFree: false,
    icon: Calendar,
    color: 'bg-slate-800 text-white'
  },
  {
    id: 'zen',
    title: 'Zen Garden',
    description: 'Rake sand and place stones in your digital garden.',
    price: 100,
    isFree: false,
    icon: Gamepad2,
    color: 'bg-destructive text-white'
  }
];

export default function GamesPage() {
  const { balances, buyGame, ownedGames } = useWeb3(); // Mock extended hook usage
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Temporary mock state since hook isn't fully updated yet
  const mockOwned = ['bubble', 'memory', 'breathing'];
  const mockBalance = 120; // FEELS tokens

  const handleBuy = (gameId: string) => {
    setPurchasing(gameId);
    setTimeout(() => {
      setPurchasing(null);
      // In real app, this would update ownedGames
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b-2 border-black pb-6">
        <div>
          <h1 className="text-5xl font-heading font-black text-black uppercase tracking-tighter">Arcade</h1>
          <p className="text-xl font-bold text-slate-500 mt-2">Spend FEELS tokens to unlock new experiences.</p>
        </div>
        <div className="bg-black text-white px-6 py-3 rounded-lg border-2 border-black shadow-flat-sm flex items-center gap-3">
          <Coins className="w-6 h-6 text-accent" />
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase">Balance</div>
            <div className="text-xl font-black leading-none">{mockBalance} FEELS</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES.map((game, idx) => {
          const isOwned = mockOwned.includes(game.id);
          const canAfford = mockBalance >= game.price;
          const Icon = game.icon;

          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`
                relative p-6 rounded-xl border-2 border-black bg-white shadow-flat flex flex-col h-full
                ${!isOwned && !canAfford ? 'opacity-75' : ''}
              `}
            >
              <div className={`w-16 h-16 rounded-lg border-2 border-black flex items-center justify-center mb-4 ${game.color} shadow-flat-sm`}>
                <Icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">{game.title}</h3>
              <p className="text-sm font-bold text-slate-500 mb-6 flex-1">{game.description}</p>

              {isOwned ? (
                <Link href={`/game/${game.id}`}>
                  <Button className="w-full btn-flat bg-black text-white font-bold py-6 text-lg">
                    PLAY NOW
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={() => handleBuy(game.id)}
                  disabled={!canAfford || purchasing === game.id}
                  className={`
                    w-full btn-flat font-bold py-6 text-lg border-2 border-black
                    ${canAfford ? 'bg-accent text-black hover:bg-accent/90' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                  `}
                >
                  {purchasing === game.id ? (
                    "UNLOCKING..."
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      UNLOCK {game.price} FEELS
                    </>
                  )}
                </Button>
              )}

              {/* Price Tag */}
              {!isOwned && (
                <div className="absolute top-4 right-4 bg-white border-2 border-black px-3 py-1 rounded-md font-black text-sm shadow-flat-sm">
                  {game.price} FEELS
                </div>
              )}
              
              {/* Free Tag */}
              {game.isFree && (
                <div className="absolute top-4 right-4 bg-green-400 border-2 border-black px-3 py-1 rounded-md font-black text-sm shadow-flat-sm text-black">
                  FREE
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
