import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trophy, Star, Heart, Cloud, Sun, Moon, Music, Zap, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ICONS = [Star, Heart, Cloud, Sun, Moon, Music, Zap, Anchor];

interface Card {
  id: number;
  iconIdx: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryMatch({ onComplete }: { onComplete: (score: number) => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const initializeGame = () => {
    const gameIcons = [...ICONS.slice(0, 6), ...ICONS.slice(0, 6)]; // 6 pairs = 12 cards
    const shuffled = gameIcons
      .map((_, i) => ({ id: i, iconIdx: i % 6, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedIndices([]);
    setIsLocked(false);
    setMoves(0);
    setMatches(0);
    setIsPlaying(true);
  };

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched || !isPlaying) return;

    // Flip the card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      // Check match
      const [first, second] = newFlipped;
      if (cards[first].iconIdx === cards[second].iconIdx) {
        // Match!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setIsLocked(false);
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === 6) {
              setIsPlaying(false);
              onComplete(100 - moves * 2); // Simple score calculation
            }
            return newMatches;
          });
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full h-[600px] relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border-4 border-white/50 shadow-xl flex flex-col items-center justify-center p-8">
      
      {/* HUD */}
      <div className="absolute top-4 left-0 right-0 px-8 flex justify-between z-20 pointer-events-none">
        <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm border border-white/50">
          <span className="text-slate-500 font-medium">Moves</span>
          <span className="ml-2 text-2xl font-bold text-slate-800">{moves}</span>
        </div>
        <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm border border-white/50">
          <span className="text-slate-500 font-medium">Matches</span>
          <span className="ml-2 text-2xl font-bold text-slate-800">{matches}/6</span>
        </div>
      </div>

      {/* Start Screen */}
      {!isPlaying && matches === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm z-30">
          <h2 className="text-4xl font-heading font-bold text-slate-800 mb-4">Mind Match</h2>
          <p className="text-slate-600 mb-8 text-center max-w-md">Find the pairs to center your mind and improve focus.</p>
          <Button onClick={initializeGame} size="lg" className="rounded-full text-lg px-8 py-6 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
            Start Focusing
          </Button>
        </div>
      )}

      {/* Game Over */}
      {!isPlaying && matches === 6 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm z-30">
          <Trophy className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
          <h2 className="text-4xl font-heading font-bold text-slate-800 mb-2">Mind Cleared!</h2>
          <p className="text-slate-600 mb-8">You completed it in {moves} moves.</p>
          <Button onClick={initializeGame} variant="outline" size="lg" className="rounded-full border-2">
            <RefreshCw className="w-4 h-4 mr-2" /> Play Again
          </Button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full max-w-md mx-auto perspective-1000">
        {cards.map((card, idx) => {
          const Icon = ICONS[card.iconIdx];
          return (
            <motion.div
              key={card.id}
              className="relative aspect-square cursor-pointer"
              onClick={() => handleCardClick(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={`w-full h-full rounded-xl shadow-md absolute backface-hidden transition-all duration-500 transform-style-3d ${
                  card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                }`}
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Front (Hidden) */}
                <div className="absolute inset-0 bg-white rounded-xl border-2 border-indigo-100 flex items-center justify-center backface-hidden"
                     style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                   <Icon className="w-8 h-8 text-indigo-500" />
                </div>
                
                {/* Back (Visible) */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center backface-hidden"
                     style={{ backfaceVisibility: 'hidden' }}>
                  <div className="w-4 h-4 rounded-full bg-white/20" />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
