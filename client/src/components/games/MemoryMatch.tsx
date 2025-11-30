import React, { useState } from 'react';
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
    const gameIcons = [...ICONS.slice(0, 6), ...ICONS.slice(0, 6)];
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

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      const [first, second] = newFlipped;
      if (cards[first].iconIdx === cards[second].iconIdx) {
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
              onComplete(100 - moves * 2);
            }
            return newMatches;
          });
        }, 500);
      } else {
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
    <div className="w-full h-[600px] relative overflow-hidden rounded-lg bg-white border-2 border-black shadow-flat flex flex-col items-center justify-center p-8">
      
      {/* HUD */}
      <div className="absolute top-4 left-0 right-0 px-8 flex justify-between z-20 pointer-events-none">
        <div className="bg-white px-6 py-2 rounded-lg border-2 border-black shadow-flat-sm">
          <span className="text-black font-bold uppercase text-xs tracking-wider">Moves</span>
          <span className="ml-2 text-2xl font-black text-black">{moves}</span>
        </div>
        <div className="bg-white px-6 py-2 rounded-lg border-2 border-black shadow-flat-sm">
          <span className="text-black font-bold uppercase text-xs tracking-wider">Matches</span>
          <span className="ml-2 text-2xl font-black text-black">{matches}/6</span>
        </div>
      </div>

      {/* Start Screen */}
      {!isPlaying && matches === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30">
          <h2 className="text-5xl font-heading font-black text-black mb-4 uppercase tracking-tighter">Mind Match</h2>
          <p className="text-slate-600 mb-8 text-center max-w-md font-medium">Find pairs. Focus up. Get rewards.</p>
          <Button onClick={initializeGame} size="lg" className="btn-flat bg-primary text-white font-bold rounded-none text-xl px-10 py-8">
            Start Focusing
          </Button>
        </div>
      )}

      {/* Game Over */}
      {!isPlaying && matches === 6 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30">
          <Trophy className="w-20 h-20 text-yellow-400 mb-4 stroke-[2px] stroke-black fill-yellow-400" />
          <h2 className="text-4xl font-heading font-black text-black mb-2 uppercase">Cleared!</h2>
          <p className="text-black font-bold text-xl mb-8">Moves: {moves}</p>
          <Button onClick={initializeGame} variant="outline" size="lg" className="btn-flat bg-white hover:bg-slate-50 text-black border-2 border-black">
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
                className={`w-full h-full rounded-lg border-2 border-black shadow-flat-sm absolute backface-hidden transition-all duration-500 transform-style-3d ${
                  card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                }`}
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Front (Hidden when not flipped) */}
                <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center backface-hidden"
                     style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                   <Icon className="w-8 h-8 text-primary stroke-[3px]" />
                </div>
                
                {/* Back (Visible) */}
                <div className="absolute inset-0 bg-accent rounded-lg flex items-center justify-center backface-hidden"
                     style={{ backfaceVisibility: 'hidden' }}>
                  <div className="w-4 h-4 rounded-full bg-black" />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
