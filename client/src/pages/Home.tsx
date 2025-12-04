import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Smile, Frown, CloudRain, Zap, ArrowRight, Flame, Sun, BatteryCharging, Heart, Wallet, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/hooks/use-web3';
import { EmotionDialog } from '@/components/EmotionDialog';
import { Link } from 'wouter';
import { API_ENDPOINTS } from '@/config/api';
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
  useEffect(() => {
    document.title = 'Feel Space | Home';
  }, []);

  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [showEmotionDialog, setShowEmotionDialog] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const {
    isConnected,
    logEmotion,
    history,
    setShowWalletModal,
    installedWallets,
    address
  } = useWeb3();

  const [insights, setInsights] = useState<any>(null);

  // Fetch quick insights
  useEffect(() => {
    const fetchInsights = async () => {
      if (!address || !isConnected || history.length === 0) return;

      try {
        const response = await fetch(
          API_ENDPOINTS.emotions.insights(address, 7)
        );
        if (response.ok) {
          const result = await response.json();
          setInsights(result.data);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
      }
    };

    fetchInsights();
  }, [address, isConnected, history.length]);

  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  // Calculate Streaks & Next Log Time
  const lastLog = history.length > 0 ? history[0].timestamp : 0;
  const minsSinceLastLog = Math.floor((Date.now() - lastLog) / (1000 * 60));
  const canLog = minsSinceLastLog >= 60 || history.length === 0;
  const streak = history.length > 0 ? Math.min(history.length, 5) : 0;

  // If wallet not connected, show connection gate
  if (!isConnected) {
    const installedCount = installedWallets.filter(w => w.installed).length;

    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-black rounded-2xl shadow-flat">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-black text-black tracking-tighter leading-[0.9]">
            FEEL SPACE
          </h1>
          <p className="text-xl font-bold text-slate-500 max-w-2xl mx-auto">
            Track your emotions. Play therapeutic games. Earn rewards.
          </p>

          <div className="bg-white border-2 border-black rounded-xl p-8 shadow-flat max-w-md mx-auto space-y-6 mt-8">
            <div className="space-y-3 text-left">
              <h2 className="text-2xl font-heading font-black text-black">Getting Started</h2>
              <p className="text-slate-600 font-medium">
                Connect your wallet to begin your emotional wellness journey.
              </p>

              {installedCount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <p className="text-sm font-bold text-green-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {installedCount} wallet{installedCount > 1 ? 's' : ''} detected
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleConnectWallet}
              size="lg"
              className="w-full bg-primary text-white font-bold border-2 border-black shadow-flat hover:shadow-flat-sm hover:translate-y-[2px] transition-all rounded-lg px-6 py-4 text-lg"
            >
              <Wallet className="w-5 h-5 mr-3" />
              Connect Wallet
            </Button>

            <p className="text-xs text-slate-400 text-center font-bold">
              Supports MetaMask, Coinbase, Trust Wallet, MiniPay & all EVM wallets
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl">
            <div className="bg-white border-2 border-black rounded-lg p-4 shadow-flat-sm text-center">
              <div className="w-12 h-12 bg-accent rounded-full border-2 border-black flex items-center justify-center mx-auto mb-3">
                <Smile className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-black text-sm mb-1">Track Emotions</h3>
              <p className="text-xs text-slate-500 font-medium">Log your mood and earn FEELS tokens</p>
            </div>
            <div className="bg-white border-2 border-black rounded-lg p-4 shadow-flat-sm text-center">
              <div className="w-12 h-12 bg-primary rounded-full border-2 border-black flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-sm mb-1">Play Games</h3>
              <p className="text-xs text-slate-500 font-medium">Therapeutic mini-games for wellness</p>
            </div>
            <div className="bg-white border-2 border-black rounded-lg p-4 shadow-flat-sm text-center">
              <div className="w-12 h-12 bg-secondary rounded-full border-2 border-black flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-sm mb-1">Build Streaks</h3>
              <p className="text-xs text-slate-500 font-medium">Maintain daily habits for bonuses</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleContinue = () => {
    if (!selectedEmotion) return;
    setShowEmotionDialog(true);
  };

  const handleEmotionConfirm = (intensity: number, reason: string) => {
    if (!selectedEmotion) return;

    const emotion = EMOTIONS.find(e => e.id === selectedEmotion);
    if (emotion) {
      const notes = reason.trim() || "Quick check-in";
      logEmotion(emotion.id, intensity, notes);

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

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <div className={`w-2 h-2 rounded-full ${canLog ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className="font-bold text-slate-600 text-sm">
            {canLog ? "Ready to log!" : `Next log in ${60 - minsSinceLastLog}m`}
          </span>
        </div>
      </div>

      {/* Quick Insights Widget */}
      {history.length > 0 && insights && insights.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-black p-5 rounded-xl shadow-flat"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-lg uppercase">Quick Insight</h3>
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">
                {insights.insights[0].title}
              </p>
              <p className="text-xs font-medium text-slate-600">
                {insights.insights[0].description}
              </p>
            </div>
            <Link href="/insights">
              <Button
                size="sm"
                className="btn-flat bg-purple-600 text-white border-2 border-black font-bold whitespace-nowrap"
              >
                View All
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="text-center space-y-6 mt-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-heading font-black text-black tracking-tighter leading-[0.9]"
        >
          HOW ARE YOU <br />
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

              {/* Mobile action buttons */}
              {isSelected && (
                <div className="md:hidden mt-3 w-full flex gap-2">
                  <Button
                    onClick={(e) => { e.stopPropagation(); setShowEmotionDialog(true); }}
                    className="w-1/2 btn-flat bg-black text-white font-bold border-2 border-black px-3 py-3"
                  >
                    Log Mood
                  </Button>

                  <Button
                    onClick={(e) => { e.stopPropagation(); setLocation(`/game/${emotion.game}`); }}
                    variant="outline"
                    className="w-1/2 btn-flat bg-white text-black border-2 border-black font-bold px-3 py-3"
                  >
                    Play
                  </Button>
                </div>
              )}
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
          Log Mood & Play <ArrowRight className="ml-2 w-6 h-6" />
        </Button>
      </motion.div>

      {/* Emotion Dialog */}
      <EmotionDialog
        isOpen={showEmotionDialog}
        onClose={() => setShowEmotionDialog(false)}
        emotion={selectedEmotion ? EMOTIONS.find(e => e.id === selectedEmotion) || null : null}
        onConfirm={handleEmotionConfirm}
      />
    </div>
  );
}