import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playPop, playGameOver, playTick } from '@/lib/sounds';
import { useWeb3 } from '@/hooks/use-web3';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

export function BubblePop() {
  const { recordGameSession, isConnected } = useWeb3();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const createBubble = useCallback(() => {
    const id = Date.now() + Math.random();
    const size = Math.random() * 60 + 40;
    const x = Math.random() * (window.innerWidth < 600 ? 80 : 90);
    const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-destructive'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      id,
      x,
      y: 110,
      size,
      color,
      speed: Math.random() * 0.5 + 0.5,
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBubbles(prev => {
        const newBubbles = [...prev];
        if (Math.random() < 0.1) {
          newBubbles.push(createBubble());
        }
        return newBubbles
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -20);
      });
    }, 50);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          playGameOver();

          if (isConnected) {
            // fire and forget; errors handled in useWeb3
            recordGameSession('bubble', score);
          }

          return 0;
        }
        if (prev <= 5 && prev % 1 === 0) playTick();
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isPlaying, createBubble, score, isConnected, recordGameSession]);

  const popBubble = (id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 10);
    playPop();
  };

  const startGame = () => {
    setBubbles([]);
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  return (
    <div className="w-full h-[600px] relative overflow-hidden rounded-lg bg-white border-2 border-black shadow-flat flex flex-col">
      {/* HUD */}
      <div className="absolute top-4 left-0 right-0 px-8 flex justify-between z-20 pointer-events-none">
        <div className="bg-white px-6 py-2 rounded-lg border-2 border-black shadow-flat-sm">
          <span className="text-black font-bold uppercase text-xs tracking-wider">Score</span>
          <span className="ml-2 text-2xl font-black text-black">{score}</span>
        </div>
        <div className="bg-white px-6 py-2 rounded-lg border-2 border-black shadow-flat-sm">
          <span className="text-black font-bold uppercase text-xs tracking-wider">Time</span>
          <span
            className={`ml-2 text-2xl font-black ${timeLeft < 10 ? 'text-destructive' : 'text-black'
              }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Start Screen */}
      {!isPlaying && timeLeft === 30 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30 p-4"
        >
          <motion.h2
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="text-5xl font-heading font-black text-black mb-4 uppercase tracking-tighter"
          >
            Bubble Pop
          </motion.h2>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-left space-y-4 mb-8 border-2 border-black p-6 rounded-xl bg-slate-50"
          >
            <h3 className="font-bold text-xl border-b-2 border-black pb-2 mb-2">
              How to Play:
            </h3>
            <ul className="list-disc list-inside font-medium space-y-2">
              <li>Tap bubbles to pop them</li>
              <li>Each pop earns 10 points</li>
              <li>Clear as many as you can in 30s</li>
              <li>Release your stress with every pop!</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={startGame}
              size="lg"
              className="btn-flat bg-accent text-black font-bold rounded-none text-xl px-10 py-8"
              disabled={!isConnected}
            >
              {isConnected ? 'Start Popping' : 'Connect Wallet to Start'}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Game Over Screen */}
      {!isPlaying && timeLeft === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <Trophy className="w-20 h-20 text-accent mb-4 stroke-[2px] stroke-black fill-accent" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-heading font-black text-black mb-2 uppercase"
          >
            Great Job!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-black font-bold text-xl mb-8"
          >
            Score: {score}
          </motion.p>
          <Button
            onClick={startGame}
            variant="outline"
            size="lg"
            className="btn-flat bg-white hover:bg-slate-50 text-black border-2 border-black"
            disabled={!isConnected}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Play Again
          </Button>
        </motion.div>
      )}

      {/* Bubbles */}
      <AnimatePresence>
        {bubbles.map(bubble => (
          <motion.button
            key={bubble.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              top: `${bubble.y}%`,
              left: `${bubble.x}%`,
            }}
            exit={{ scale: 1.5, opacity: 0 }}
            className={`absolute rounded-full cursor-pointer border-2 border-black ${bubble.color}`}
            style={{
              width: bubble.size,
              height: bubble.size,
            }}
            onClick={() => popBubble(bubble.id)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
