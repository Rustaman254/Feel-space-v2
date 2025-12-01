import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wind } from 'lucide-react';
import { playBreathingCue, playComplete, playTick } from '@/lib/sounds';
import { useWeb3 } from '@/hooks/use-web3';

export function Breathing() {
  const { recordGameSession, isConnected } = useWeb3();
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold2'>('inhale');
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute session
  const [isPlaying, setIsPlaying] = useState(false);
  const [cycles, setCycles] = useState(0);

  // Handle session timer and completion
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          playComplete();

          const score = 100 + cycles * 10;
          if (isConnected) {
            // Fire and forget; errors will be handled by useWeb3 toast
            recordGameSession('breathing', score);
          }

          return 0;
        }
        if (prev % 5 === 0) playTick(); // Tick every 5 seconds
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, cycles, isConnected, recordGameSession]);

  // Breathing Cycle Logic
  useEffect(() => {
    if (!isPlaying) return;

    const inhaleDuration = 4000;
    const holdDuration = 4000;
    const exhaleDuration = 4000;
    const hold2Duration = 4000;

    let timeout: NodeJS.Timeout;

    const runCycle = () => {
      setPhase('inhale');
      playBreathingCue();
      timeout = setTimeout(() => {
        setPhase('hold');
        timeout = setTimeout(() => {
          setPhase('exhale');
          playBreathingCue();
          timeout = setTimeout(() => {
            setPhase('hold2');
            timeout = setTimeout(() => {
              setCycles(c => c + 1);
              runCycle();
            }, hold2Duration);
          }, exhaleDuration);
        }, holdDuration);
      }, inhaleDuration);
    };

    runCycle();

    return () => clearTimeout(timeout);
  }, [isPlaying]);

  const startGame = () => {
    setCycles(0);
    setTimeLeft(60);
    setIsPlaying(true);
  };

  const getInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Inhale...';
      case 'hold':
        return 'Hold...';
      case 'exhale':
        return 'Exhale...';
      case 'hold2':
        return 'Hold...';
    }
  };

  const getScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.5;
      case 'hold':
        return 1.5;
      case 'exhale':
        return 1;
      case 'hold2':
        return 1;
    }
  };

  return (
    <div className="w-full h-[600px] relative overflow-hidden rounded-lg bg-white border-2 border-black shadow-flat flex flex-col items-center justify-center p-8">
      {/* HUD */}
      <div className="absolute top-4 left-0 right-0 px-8 flex justify-between z-20 pointer-events-none">
        <div className="bg-white px-6 py-2 rounded-lg border-2 border-black shadow-flat-sm">
          <span className="text-black font-bold uppercase text-xs tracking-wider">Time</span>
          <span className="ml-2 text-2xl font-black text-black">{timeLeft}s</span>
        </div>
        <div className="bg-white px-6 py-2 rounded-lg border-2 border-black shadow-flat-sm">
          <span className="text-black font-bold uppercase text-xs tracking-wider">Cycles</span>
          <span className="ml-2 text-2xl font-black text-black">{cycles}</span>
        </div>
      </div>

      {/* Start Screen */}
      {!isPlaying && timeLeft === 60 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30 p-8 text-center"
        >
          <motion.h2
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="text-5xl font-heading font-black text-black mb-4 uppercase tracking-tighter"
          >
            Box Breathing
          </motion.h2>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-left space-y-4 mb-8 border-2 border-black p-6 rounded-xl bg-slate-50"
          >
            <h3 className="font-bold text-xl border-b-2 border-black pb-2 mb-2">
              Instructions:
            </h3>
            <ol className="list-decimal list-inside font-medium space-y-2">
              <li>Inhale deeply for 4 seconds</li>
              <li>Hold your breath for 4 seconds</li>
              <li>Exhale slowly for 4 seconds</li>
              <li>Hold empty for 4 seconds</li>
            </ol>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={startGame}
              size="lg"
              className="btn-flat bg-accent text-black font-bold rounded-none text-xl px-12 py-8"
              disabled={!isConnected}
            >
              {isConnected ? 'Start Breathing' : 'Connect Wallet to Start'}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Game Over */}
      {!isPlaying && timeLeft === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30 p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <Wind className="w-20 h-20 text-blue-400 mb-4" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-heading font-black text-black mb-2 uppercase"
          >
            Session Complete
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-black font-bold text-xl mb-8"
          >
            You completed {cycles} cycles.
          </motion.p>
          <Button
            onClick={startGame}
            variant="outline"
            size="lg"
            className="btn-flat bg-white hover:bg-slate-50 text-black border-2 border-black"
            disabled={!isConnected}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Again
          </Button>
        </motion.div>
      )}

      {/* Breathing Circle */}
      {isPlaying && (
        <div className="relative flex items-center justify-center">
          {/* Guide Text */}
          <motion.div
            className="absolute z-10 text-3xl font-black uppercase tracking-widest text-white drop-shadow-md pointer-events-none"
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {getInstruction()}
          </motion.div>

          <motion.div
            animate={{ scale: getScale() }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-4 border-black shadow-flat-lg flex items-center justify-center"
          >
            <div className="w-48 h-48 rounded-full border-2 border-white/30" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
