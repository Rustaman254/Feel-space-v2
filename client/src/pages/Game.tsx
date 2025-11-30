import React from 'react';
import { useRoute, Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BubblePop } from '@/components/games/BubblePop';
import { MemoryMatch } from '@/components/games/MemoryMatch';
import { motion } from 'framer-motion';

export default function Game() {
  const [match, params] = useRoute('/game/:type');
  const gameType = params?.type;

  const handleComplete = (score: number) => {
    // Could submit score to contract here
    console.log('Game completed with score:', score);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/50">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {gameType === 'bubble' ? 'Bubble Pop' : 'Mind Match'}
          </h1>
          <p className="text-slate-500 text-sm">
            {gameType === 'bubble' ? 'Stress Relief Session' : 'Focus Enhancement Session'}
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl p-1"
      >
        {gameType === 'bubble' ? (
          <BubblePop onComplete={handleComplete} />
        ) : (
          <MemoryMatch onComplete={handleComplete} />
        )}
      </motion.div>
    </div>
  );
}
