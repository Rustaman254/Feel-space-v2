import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Smile, Frown, CloudRain, Zap, ArrowRight, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/hooks/use-web3';

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
  const { isConnected, connect } = useWeb3();

  const handleContinue = () => {
    if (!selectedEmotion) return;
    
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Connect your Celo wallet to continue.",
        variant: "destructive"
      });
      connect();
      return;
    }

    const emotion = EMOTIONS.find(e => e.id === selectedEmotion);
    if (emotion) {
      // Transaction logic would go here
      toast({
        title: "Emotion Logged!",
        description: `Recorded "${emotion.label}" on Celo Alfajores.`,
      });
      
      setTimeout(() => {
        setLocation(`/game/${emotion.game}`);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block bg-accent border-2 border-black px-4 py-1 rounded-full font-bold text-sm mb-4 shadow-flat-sm"
        >
          LIVE ON CELO ALFAJORES
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-heading font-black text-black tracking-tighter leading-[0.9]"
        >
          HOW ARE YOU <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary stroke-black" style={{ WebkitTextStroke: '2px black' }}>FEELING?</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-slate-500 max-w-2xl mx-auto"
        >
          Track your vibe. Earn tokens. Find balance.
        </motion.p>
      </section>

      {/* Emotion Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {EMOTIONS.map((emotion, idx) => {
          const Icon = emotion.icon;
          const isSelected = selectedEmotion === emotion.id;
          
          return (
            <motion.div
              key={emotion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              onClick={() => setSelectedEmotion(emotion.id)}
              className={`
                relative p-6 rounded-xl cursor-pointer transition-all duration-200 border-2 border-black
                ${isSelected 
                  ? 'bg-white shadow-flat scale-105 -translate-y-2 ring-2 ring-black' 
                  : 'bg-white shadow-flat-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                }
              `}
            >
              <div className={`w-16 h-16 rounded-lg border-2 border-black flex items-center justify-center mb-4 ${emotion.color} shadow-flat-sm`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">{emotion.label}</h3>
              <p className="text-sm font-bold text-slate-500 mb-4 leading-tight">{emotion.description}</p>
              
              <div className={`
                text-xs font-black uppercase px-3 py-2 rounded-md border border-black inline-flex items-center gap-1
                ${isSelected ? 'bg-black text-white' : 'bg-slate-100 text-black'}
              `}>
                Play: {emotion.gameTitle}
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Action Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center pt-8 pb-20"
      >
        <Button 
          size="lg" 
          className={`
            btn-flat bg-black text-white text-xl px-12 py-8 rounded-lg font-black uppercase tracking-wide
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
              <Lock className="ml-2 w-5 h-5 mr-2" /> Connect to Log Mood
            </>
          )}
        </Button>
      </motion.div>
      
      <div className="text-center pb-10 text-sm text-slate-400 font-bold">
        <Info className="w-4 h-4 inline mr-1" />
        Requires Celo Alfajores (Testnet) funds to interact
      </div>
    </div>
  );
}
