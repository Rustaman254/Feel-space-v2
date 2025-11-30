import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Smile, Frown, CloudRain, Zap, ArrowRight, Lock, Info, Flame, Sun, BatteryCharging, Heart, Coffee, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/hooks/use-web3';
import { WalletModal } from '@/components/WalletModal';
import { differenceInMinutes } from 'date-fns';

const EMOTIONS = [
  {
    id: 'happy',
    label: 'Happy',
    icon: Smile,
    color: 'bg-accent text-black',
    description: 'Feeling energetic & positive',
    game: 'memory', 
    gameTitle: 'Mind Match'
  },
  {
    id: 'excited',
    label: 'Excited',
    icon: Flame,
    color: 'bg-orange-400 text-black',
    description: 'Hyped and ready to go',
    game: 'memory',
    gameTitle: 'Mind Match'
  },
  {
    id: 'grateful',
    label: 'Grateful',
    icon: Heart,
    color: 'bg-pink-400 text-white',
    description: 'Feeling appreciative',
    game: 'breathing',
    gameTitle: 'Breathing'
  },
  {
    id: 'calm',
    label: 'Calm',
    icon: Sun,
    color: 'bg-yellow-200 text-yellow-800',
    description: 'Peaceful and centered',
    game: 'breathing',
    gameTitle: 'Breathing'
  },
  {
    id: 'tired',
    label: 'Tired',
    icon: BatteryCharging,
    color: 'bg-slate-300 text-slate-600',
    description: 'Low energy, need rest',
    game: 'breathing',
    gameTitle: 'Breathing'
  },
  {
    id: 'anxious',
    label: 'Anxious',
    icon: Zap,
    color: 'bg-primary text-white',
    description: 'Feeling jittery or worried',
    game: 'bubble',
    gameTitle: 'Bubble Pop'
  },
  {
    id: 'sad',
    label: 'Sad',
    icon: CloudRain,
    color: 'bg-secondary text-white',
    description: 'Feeling down or blue',
    game: 'bubble',
    gameTitle: 'Bubble Pop'
  },
  {
    id: 'angry',
    label: 'Frustrated',
    icon: Frown,
    color: 'bg-destructive text-white',
    description: 'Feeling tense or angry',
    game: 'bubble',
    gameTitle: 'Bubble Pop'
  }
];

export default function Home() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isConnected, connect, logEmotion, history, showWalletModal, setShowWalletModal, installedWallets } = useWeb3();

  // Calculate Streaks & Next Log Time
  const lastLog = history.length > 0 ? history[0].timestamp : 0;
  const minsSinceLastLog = differenceInMinutes(Date.now(), lastLog);
  const canLog = minsSinceLastLog >= 60 || history.length === 0;
  const streak = history.length > 0 ? Math.min(history.length, 5) : 0;

  // If wallet not connected, show connection gate
  if (!isConnected) {
    return (
      <>
        <div className="flex flex-col gap-8 max-w-5xl mx-auto items-center justify-center min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-heading font-black text-black tracking-tighter leading-[0.9]">
              FEEL SPACE
            </h1>
            <p className="text-xl font-bold text-slate-500 max-w-2xl mx-auto">
              Track your emotions. Play therapeutic games. Earn rewards.
            </p>

            <div className="bg-white border-2 border-black rounded-xl p-8 shadow-flat max-w-md mx-auto space-y-6">
              <div className="space-y-3 text-left">
                <h2 className="text-2xl font-heading font-black text-black">Getting Started</h2>
                <p className="text-slate-600 font-medium">Connect your wallet to begin your emotional wellness journey.</p>
              </div>

              <Button 
                onClick={() => setShowWalletModal(true)}
                size="lg"
                className="w-full bg-primary text-white font-bold border-2 border-black shadow-flat hover:shadow-flat-sm hover:translate-y-[2px] transition-all rounded-lg px-6 py-8 text-lg"
              >
                <Wallet className="w-5 h-5 mr-3" />
                Connect Wallet
              </Button>

              <p className="text-xs text-slate-400 text-center font-bold">
                Supports MetaMask, MiniPay & all EVM wallets on Celo Alfajores
              </p>
            </div>
          </motion.div>
        </div>
        <WalletModal 
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          installedWallets={installedWallets}
          onSelectWallet={connect}
        />
      </>
    );
  }

  const handleContinue = () => {
    if (!selectedEmotion) return;

    const emotion = EMOTIONS.find(e => e.id === selectedEmotion);
    if (emotion) {
      logEmotion(emotion.id, 5, "Quick check-in");
      
      toast({
        title: "Emotion Logged! +10 FEELS",
        description: `You're on a ${streak + 1}x streak!`,
        className: "bg-green-50 border-2 border-green-600"
      });
      
      setTimeout(() => {
        setLocation(`/game/${emotion.game}`);
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      
      {/* Streak / Status Banner */}
      {(
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white border-2 border-black p-4 rounded-xl shadow-flat-sm">
           <div className="flex items-center gap-3">
             <div className="bg-orange-100 p-2 rounded-lg border border-orange-400">
               <Flame className="w-6 h-6 text-orange-500" />
             </div>
             <div>
               <h3 className="font-black text-lg leading-none">Day {streak} Streak</h3>
               <p className="text-xs font-bold text-slate-500">Keep it up for bonus FEELS!</p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <Coffee className="w-5 h-5 text-slate-400" />
             <span className="font-bold text-slate-600 text-sm">
               {canLog ? "Ready to log!" : `Next log in ${60 - minsSinceLastLog}m`}
             </span>
           </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center space-y-6 mt-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-heading font-black text-black tracking-tighter leading-[0.9]"
        >
          HOW ARE YOU <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary stroke-black" style={{ WebkitTextStroke: '2px black' }}>FEELING?</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-bold text-slate-500 max-w-2xl mx-auto"
        >
          Log your mood. Earn FEELS. Find your space.
        </motion.p>
      </section>

      {/* Emotion Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {EMOTIONS.map((emotion, idx) => {
          const Icon = emotion.icon;
          const isSelected = selectedEmotion === emotion.id;
          
          return (
            <motion.div
              key={emotion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              onClick={() => setSelectedEmotion(emotion.id)}
              className={`
                relative p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 border-black flex flex-col items-center text-center h-full justify-between
                ${isSelected 
                  ? 'bg-white shadow-flat scale-105 -translate-y-1 ring-2 ring-black z-10' 
                  : 'bg-white shadow-flat-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'
                }
              `}
            >
              <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mb-3 ${emotion.color} shadow-sm`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-black mb-1 uppercase tracking-tight leading-none">{emotion.label}</h3>
                <p className="text-[10px] font-bold text-slate-400 leading-tight">{emotion.description}</p>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Action Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center pt-4 pb-12"
      >
        <Button 
          size="lg" 
          className={`
            btn-flat bg-black text-white text-xl px-12 py-8 rounded-xl font-black uppercase tracking-wide w-full md:w-auto
            ${selectedEmotion ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}
          `}
          disabled={!selectedEmotion}
          onClick={selectedEmotion ? handleContinue : undefined}
        >
          {isConnected ? (
            <>
              Log Mood & Play <ArrowRight className="ml-2 w-6 h-6" />
            </>
          ) : (
            <>
              <Lock className="ml-2 w-5 h-5 mr-2" /> Connect Wallet
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
