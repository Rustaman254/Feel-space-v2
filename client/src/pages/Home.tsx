import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Smile, Frown, CloudRain, Zap, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';

const EMOTIONS = [
  {
    id: 'happy',
    label: 'Happy',
    icon: Smile,
    color: 'bg-yellow-100 text-yellow-600',
    description: 'Feeling energetic and positive',
    game: 'memory', 
    gameTitle: 'Mind Match'
  },
  {
    id: 'anxious',
    label: 'Anxious',
    icon: Zap,
    color: 'bg-purple-100 text-purple-600',
    description: 'Feeling jittery or worried',
    game: 'bubble',
    gameTitle: 'Bubble Pop'
  },
  {
    id: 'sad',
    label: 'Sad',
    icon: CloudRain,
    color: 'bg-blue-100 text-blue-600',
    description: 'Feeling down or blue',
    game: 'bubble',
    gameTitle: 'Bubble Pop'
  },
  {
    id: 'angry',
    label: 'Frustrated',
    icon: Frown,
    color: 'bg-red-100 text-red-600',
    description: 'Feeling tense or angry',
    game: 'bubble',
    gameTitle: 'Bubble Pop'
  }
];

export default function Home() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isConnected, connect } = useWallet();

  const handleContinue = () => {
    if (!selectedEmotion) return;
    
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your Celo wallet to track your emotion on-chain.",
        variant: "destructive"
      });
      return;
    }

    const emotion = EMOTIONS.find(e => e.id === selectedEmotion);
    if (emotion) {
      // In a real app, we would call the smart contract here
      toast({
        title: "Emotion Logged",
        description: `Recorded "${emotion.label}" on the blockchain. +10 Tokens Reward!`,
      });
      
      setTimeout(() => {
        setLocation(`/game/${emotion.game}`);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 mt-8 relative">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-heading font-bold text-slate-900 tracking-tight"
        >
          How are you feeling?
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-600 max-w-2xl mx-auto"
        >
          Track your emotional wellbeing on Celo and discover games to help you find balance.
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
                relative p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2 group
                ${isSelected 
                  ? 'bg-white border-primary shadow-xl scale-105 ring-4 ring-primary/10' 
                  : 'bg-white/40 border-white/60 hover:bg-white/60 hover:border-white hover:shadow-lg hover:-translate-y-1'
                }
              `}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${emotion.color}`}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{emotion.label}</h3>
              <p className="text-sm text-slate-500 mb-4">{emotion.description}</p>
              
              <div className={`
                text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1
                ${isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}
              `}>
                Recommended: {emotion.gameTitle}
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
            rounded-full px-10 py-8 text-xl shadow-2xl transition-all duration-500
            ${selectedEmotion ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 cursor-not-allowed'}
          `}
          disabled={!selectedEmotion}
          onClick={selectedEmotion ? handleContinue : undefined}
        >
          {isConnected ? (
            <>
              Check In & Play <ArrowRight className="ml-2 w-6 h-6" />
            </>
          ) : (
            <>
              <Lock className="ml-2 w-5 h-5 mr-2" /> Connect Wallet to Continue
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
