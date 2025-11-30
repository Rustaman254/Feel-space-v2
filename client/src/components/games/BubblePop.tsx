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

  // Generate a random bubble
  const createBubble = useCallback(() => {
    const id = Date.now() + Math.random();
    const size = Math.random() * 60 + 40; // 40-100px
    const x = Math.random() * (window.innerWidth < 600 ? 80 : 90); // % position
    const colors = ['bg-teal-300', 'bg-purple-300', 'bg-pink-300', 'bg-blue-300'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      id,
      x,
      y: 110, // Start below screen
      size,
      color,
      speed: Math.random() * 0.5 + 0.5
    };
  }, []);

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBubbles(prev => {
        // Add new bubble occasionally
        const newBubbles = [...prev];
        if (Math.random() < 0.1) {
          newBubbles.push(createBubble());
        }

        // Move bubbles up
        return newBubbles
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -20); // Remove if off screen
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
    // Add sound effect here if feasible, visual feedback is handled by removal
  };

  const startGame = () => {
    setBubbles([]);
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  return (
    <div className="w-full h-[600px] relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-50 to-white border-4 border-white/50 shadow-xl">
      {/* HUD */}
      <div className="absolute top-4 left-0 right-0 px-8 flex justify-between z-20 pointer-events-none">
        <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm border border-white/50">
          <span className="text-slate-500 font-medium">Score</span>
          <span className="ml-2 text-2xl font-bold text-slate-800">{score}</span>
        </div>
        <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm border border-white/50">
          <span className="text-slate-500 font-medium">Time</span>
          <span className={`ml-2 text-2xl font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-slate-800'}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Start Screen */}
      {!isPlaying && timeLeft === 30 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm z-30">
          <h2 className="text-4xl font-heading font-bold text-slate-800 mb-4">Bubble Pop</h2>
          <p className="text-slate-600 mb-8 text-center max-w-md">Pop the bubbles to release your stress. Take a deep breath with each pop.</p>
          <Button onClick={startGame} size="lg" className="rounded-full text-lg px-8 py-6 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
            Start Popping
          </Button>
        </div>
      )}

      {/* Game Over Screen */}
      {!isPlaying && timeLeft === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm z-30">
          <Trophy className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
          <h2 className="text-4xl font-heading font-bold text-slate-800 mb-2">Great Job!</h2>
          <p className="text-slate-600 mb-8">You scored {score} points.</p>
          <Button onClick={startGame} variant="outline" size="lg" className="rounded-full border-2">
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
            animate={{ scale: 1, opacity: 0.8, top: `${bubble.y}%`, left: `${bubble.x}%` }}
            exit={{ scale: 1.5, opacity: 0 }}
            className={`absolute rounded-full cursor-pointer shadow-inner backdrop-blur-sm border border-white/40 ${bubble.color}`}
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
