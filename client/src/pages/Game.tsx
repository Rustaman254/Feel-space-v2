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
          <Button variant="outline" size="icon" className="border-2 border-black shadow-flat-sm hover:shadow-none hover:translate-y-[2px] transition-all rounded-lg">
            <ArrowLeft className="w-6 h-6 text-black" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-heading font-black text-black uppercase tracking-tight">
            {gameType === 'bubble' ? 'Bubble Pop' : 'Mind Match'}
          </h1>
          <p className="text-slate-500 font-bold text-lg">
            {gameType === 'bubble' ? 'Stress Relief Session' : 'Focus Enhancement Session'}
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-1"
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
