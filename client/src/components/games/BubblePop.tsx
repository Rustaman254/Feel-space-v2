import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

export function BubblePop({ onComplete }: { onComplete: (score: number) => void }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const createBubble = useCallback(() => {
    const id = Date.now() + Math.random();
    const size = Math.random() * 60 + 40; 
    const x = Math.random() * (window.innerWidth < 600 ? 80 : 90);
    // Flat, solid colors for the new design
    const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-destructive'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      id,
      x,
      y: 110, 
      size,
      color,
      speed: Math.random() * 0.5 + 0.5
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
          onComplete(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isPlaying, createBubble, onComplete, score]);

  const popBubble = (id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 10);
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
          <span className={`ml-2 text-2xl font-black ${timeLeft < 10 ? 'text-destructive' : 'text-black'}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Start Screen */}
      {!isPlaying && timeLeft === 30 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30">
          <h2 className="text-5xl font-heading font-black text-black mb-4 uppercase tracking-tighter">Bubble Pop</h2>
          <p className="text-slate-600 mb-8 text-center max-w-md font-medium">Pop bubbles. Relieve stress. Simple.</p>
          <Button onClick={startGame} size="lg" className="btn-flat bg-accent text-black font-bold rounded-none text-xl px-10 py-8">
            Start Popping
          </Button>
        </div>
      )}

      {/* Game Over Screen */}
      {!isPlaying && timeLeft === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30">
          <Trophy className="w-20 h-20 text-accent mb-4 stroke-[2px] stroke-black fill-accent" />
          <h2 className="text-4xl font-heading font-black text-black mb-2 uppercase">Great Job!</h2>
          <p className="text-black font-bold text-xl mb-8">Score: {score}</p>
          <Button onClick={startGame} variant="outline" size="lg" className="btn-flat bg-white hover:bg-slate-50 text-black border-2 border-black">
            <RefreshCw className="w-4 h-4 mr-2" /> Play Again
          </Button>
        </div>
      )}

      {/* Bubbles */}
      <AnimatePresence>
        {bubbles.map(bubble => (
          <motion.button
            key={bubble.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, top: `${bubble.y}%`, left: `${bubble.x}%` }}
            exit={{ scale: 1.5, opacity: 0 }}
            className={`absolute rounded-full cursor-pointer border-2 border-black ${bubble.color}`}
            style={{ 
              width: bubble.size, 
              height: bubble.size,
            }}
            onClick={() => popBubble(bubble.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
