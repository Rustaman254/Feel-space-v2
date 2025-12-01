import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playMatch, playWrong, playComplete } from '@/lib/sounds';
import { useWeb3 } from '@/hooks/use-web3';

// Use stock images for memory matching instead of just icons
import happySun from '@assets/stock_images/cute_minimalist_flat_1bb94a89.jpg';
import calmMoon from '@assets/stock_images/cute_minimalist_flat_f86f71f5.jpg';
import musicNote from '@assets/stock_images/cute_minimalist_flat_20b12d4e.jpg';
import lightning from '@assets/stock_images/cute_minimalist_flat_eac62b69.jpg';
import cloud from '@assets/stock_images/cute_minimalist_flat_83a5735d.jpg';
import heart from '@assets/stock_images/cute_minimalist_flat_506f5106.jpg';

const CARD_IMAGES = [
  { id: 'sun', src: happySun, emotion: 'Happy' },
  { id: 'moon', src: calmMoon, emotion: 'Calm' },
  { id: 'music', src: musicNote, emotion: 'Excited' },
  { id: 'zap', src: lightning, emotion: 'Anxious' },
  { id: 'cloud', src: cloud, emotion: 'Sad' },
  { id: 'heart', src: heart, emotion: 'Grateful' },
];

interface Card {
  id: number;
  imageIdx: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryMatch() {
  const { recordGameSession, isConnected } = useWeb3();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [points, setPoints] = useState(0);

  const initializeGame = () => {
    const gameImages = [...CARD_IMAGES, ...CARD_IMAGES];
    const shuffled = gameImages
      .map((_, i) => ({
        id: i,
        imageIdx: i % 6,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedIndices([]);
    setIsLocked(false);
    setMoves(0);
    setMatches(0);
    setPoints(0);
    setIsPlaying(true);
  };

  const handleCardClick = (index: number) => {
    if (!isPlaying || !isConnected) return;
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      const [first, second] = newFlipped;
      if (cards[first].imageIdx === cards[second].imageIdx) {
        playMatch();
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setIsLocked(false);
          setPoints(p => p + 100);
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === 6) {
              setIsPlaying(false);
              const finalScore = 600 + (100 - moves * 5);
              setTimeout(() => {
                playComplete();
                // store session on-chain and mint FEELS
                recordGameSession('memory', finalScore);
              }, 300);
            }
            return newMatches;
          });
        }, 500);
      } else {
        playWrong();
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

  const finalScore = points + (100 - moves * 5);

  return (
    <div className="w-full h-[600px] relative overflow-hidden rounded-lg bg-white border-2 border-black shadow-flat flex flex-col items-center justify-center p-8">
      {/* HUD */}
      <div className="absolute top-4 left-0 right-0 px-4 md:px-8 flex justify-between z-20 pointer-events-none">
        <div className="bg-white px-4 md:px-6 py-2 rounded-lg border-2 border-black shadow-flat-sm">
          <span className="text-black font-bold uppercase text-xs tracking-wider">Moves</span>
          <span className="ml-2 text-xl md:text-2xl font-black text-black">{moves}</span>
        </div>
        <div className="bg-white px-4 md:px-6 py-2 rounded-lg border-2 border-black shadow-flat-sm">
          <span className="text-black font-bold uppercase text-xs tracking-wider">Score</span>
          <span className="ml-2 text-xl md:text-2xl font-black text-black">{points}</span>
        </div>
      </div>

      {/* Start Screen */}
      {!isPlaying && matches === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30 p-4 text-center"
        >
          <motion.h2
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="text-4xl md:text-5xl font-heading font-black text-black mb-4 uppercase tracking-tighter"
          >
            Mind Match
          </motion.h2>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-left space-y-4 mb-8 border-2 border-black p-6 rounded-xl bg-slate-50 mx-auto"
          >
            <h3 className="font-bold text-xl border-b-2 border-black pb-2 mb-2">
              How to Play:
            </h3>
            <ul className="list-disc list-inside font-medium space-y-2">
              <li>Tap cards to flip them</li>
              <li>Find matching pairs of emotions</li>
              <li>Clear the board in fewest moves</li>
              <li>Earn points for speed and accuracy</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={initializeGame}
              size="lg"
              className="btn-flat bg-primary text-white font-bold rounded-none text-xl px-10 py-8 w-full md:w-auto"
              disabled={!isConnected}
            >
              {isConnected ? 'Start Focusing' : 'Connect Wallet to Start'}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Game Over */}
      {!isPlaying && matches === 6 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30 p-4 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <Trophy className="w-20 h-20 text-yellow-400 mb-4 stroke-[2px] stroke-black fill-yellow-400" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-heading font-black text-black mb-2 uppercase"
          >
            Cleared!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-black font-bold text-xl mb-8"
          >
            Final Score: {finalScore}
          </motion.p>
          <Button
            onClick={initializeGame}
            variant="outline"
            size="lg"
            className="btn-flat bg-white hover:bg-slate-50 text-black border-2 border-black w-full md:w-auto"
            disabled={!isConnected}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Play Again
          </Button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-4 w-full max-w-md mx-auto perspective-1000">
        {cards.map((card, idx) => {
          const imageData = CARD_IMAGES[card.imageIdx];
          return (
            <motion.div
              key={card.id}
              className="relative aspect-square cursor-pointer"
              onClick={() => handleCardClick(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={`w-full h-full rounded-lg border-2 border-black shadow-flat-sm absolute backface-hidden transition-all duration-500 transform-style-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                  }`}
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                {/* Front (Image - visible when flipped) */}
                <div
                  className="absolute inset-0 bg-white rounded-lg flex flex-col items-center justify-center backface-hidden overflow-hidden p-1"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <img
                    src={imageData.src}
                    alt={`${imageData.emotion} emotion`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-black text-white drop-shadow-md"
                  >
                    {imageData.emotion}
                  </motion.p>
                </div>

                {/* Back (Visible) */}
                <motion.div
                  className="absolute inset-0 bg-accent rounded-lg flex items-center justify-center backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                  animate={{ rotateZ: card.isFlipped ? 0 : 360 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full bg-black"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>

              {/* Match Indicator */}
              {card.isMatched && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute inset-0 bg-green-400 rounded-lg flex items-center justify-center z-10"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="text-2xl"
                  >
                    ✓
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
