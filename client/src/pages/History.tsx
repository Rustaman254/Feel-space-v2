
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Smile,
  Frown,
  CloudRain,
  Zap,
  Calendar,
  Clock,
  Flame,
  Sun,
  BatteryCharging,
  Heart,
  AlertCircle,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useWeb3 } from '@/hooks/use-web3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { useEffect } from 'react';


const EMOTION_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  happy: { icon: Smile, color: 'bg-accent text-black', label: 'Happy' },
  excited: { icon: Flame, color: 'bg-orange-400 text-black', label: 'Excited' },
  grateful: { icon: Heart, color: 'bg-pink-400 text-white', label: 'Grateful' },
  calm: { icon: Sun, color: 'bg-yellow-200 text-yellow-800', label: 'Calm' },
  tired: {
    icon: BatteryCharging,
    color: 'bg-slate-300 text-slate-600',
    label: 'Tired',
  },
  anxious: { icon: Zap, color: 'bg-primary text-white', label: 'Anxious' },
  sad: { icon: CloudRain, color: 'bg-secondary text-white', label: 'Sad' },
  angry: { icon: Frown, color: 'bg-destructive text-white', label: 'Frustrated' },
};

const CELO_SEPOLIA_EXPLORER_BASE = 'https://celo-sepolia.blockscout.com';
const TX_PATH = '/tx/';

export default function HistoryPage() {
  useEffect(() => {
    document.title = 'Feel Space | History';
  }, []);

  const { history, isConnected } = useWeb3();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search logic
  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    // Filter by emotion
    if (selectedEmotion) {
      filtered = filtered.filter((entry) => entry.emotion === selectedEmotion);
    }

    // Search in notes
    if (searchQuery.trim()) {
      filtered = filtered.filter((entry) =>
        entry.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [history, selectedEmotion, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredHistory.length === 0) return null;

    const totalIntensity = filteredHistory.reduce((sum, entry) => sum + entry.intensity, 0);
    const avgIntensity = totalIntensity / filteredHistory.length;

    // Count emotions
    const emotionCounts = filteredHistory.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommon = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      count: filteredHistory.length,
      avgIntensity: avgIntensity.toFixed(1),
      mostCommon: mostCommon ? EMOTION_CONFIG[mostCommon[0]]?.label : 'N/A',
    };
  }, [filteredHistory]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-slate-100 p-8 rounded-full border-4 border-slate-200">
          <AlertCircle className="w-16 h-16 text-slate-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black font-heading uppercase">
            Wallet Not Connected
          </h2>
          <p className="text-slate-500 font-bold mt-2">
            Connect your wallet to view your mood history.
          </p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-slate-100 p-8 rounded-full border-4 border-slate-200">
          <Calendar className="w-16 h-16 text-slate-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black font-heading uppercase">
            No History Yet
          </h2>
          <p className="text-slate-500 font-bold mt-2">
            Start logging your emotions to see your timeline.
          </p>
        </div>
        <Link href="/">
          <Button className="btn-flat bg-black text-white font-bold px-8 py-6">
            Log First Mood
          </Button>
        </Link>
      </div>
    );
  }

  const uniqueEmotions = Array.from(new Set(history.map((e) => e.emotion)));

  return (
    <div className="space-y-8 pb-20">
      <div className="border-b-2 border-black pb-6">
        <h1 className="text-5xl font-heading font-black text-black uppercase tracking-tighter">
          Mood History
        </h1>
        <p className="text-xl font-bold text-slate-500 mt-2">
          Your emotional journey on-chain.
        </p>
      </div>

      {/* Statistics Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-black rounded-xl p-4 shadow-flat"
          >
            <p className="text-xs font-black uppercase text-slate-500 mb-1">Total Logs</p>
            <p className="text-3xl font-black">{stats.count}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-black rounded-xl p-4 shadow-flat"
          >
            <p className="text-xs font-black uppercase text-slate-500 mb-1">Avg Intensity</p>
            <p className="text-3xl font-black">{stats.avgIntensity}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-black rounded-xl p-4 shadow-flat"
          >
            <p className="text-xs font-black uppercase text-slate-500 mb-1">Most Common</p>
            <p className="text-lg font-black">{stats.mostCommon}</p>
          </motion.div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search in notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-black rounded-lg font-bold shadow-flat-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-black" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="btn-flat border-2 border-black font-bold"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters {selectedEmotion && '(1)'}
          </Button>
        </div>

        {/* Emotion Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white border-2 border-black rounded-xl p-4 shadow-flat"
          >
            <p className="text-xs font-black uppercase text-slate-500 mb-3">Filter by Emotion</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedEmotion(null)}
                className={`px-3 py-1.5 rounded-lg border-2 border-black font-bold text-sm transition-all ${!selectedEmotion
                    ? 'bg-black text-white shadow-flat-sm'
                    : 'bg-white hover:bg-slate-50'
                  }`}
              >
                All
              </button>
              {uniqueEmotions.map((emotion) => {
                const config = EMOTION_CONFIG[emotion];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <button
                    key={emotion}
                    onClick={() => setSelectedEmotion(emotion)}
                    className={`px-3 py-1.5 rounded-lg border-2 border-black font-bold text-sm transition-all flex items-center gap-2 ${selectedEmotion === emotion
                        ? `${config.color} shadow-flat-sm`
                        : 'bg-white hover:bg-slate-50'
                      }`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Results */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl font-bold text-slate-400">No results found</p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedEmotion(null);
            }}
            variant="outline"
            className="mt-4 btn-flat border-2 border-black font-bold"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="relative border-l-4 border-black ml-4 md:ml-8 pl-8 md:pl-12 py-4 space-y-12">
          {filteredHistory.map((entry, idx) => {
            const config = EMOTION_CONFIG[entry.emotion] || EMOTION_CONFIG.happy;
            const Icon = config.icon;
            const timestampMs =
              typeof entry.timestamp === 'number'
                ? entry.timestamp
                : Number(entry.timestamp);

            const hasTx = Boolean(entry.txHash);
            const txUrl = hasTx
              ? `${CELO_SEPOLIA_EXPLORER_BASE}${TX_PATH}${entry.txHash}`
              : undefined;

            const handleCardClick = () => {
              if (txUrl) {
                window.open(txUrl, '_blank', 'noopener,noreferrer');
              }
            };

            return (
              <motion.div
                key={`${entry.timestamp}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                {/* Timeline Node */}
                <div
                  className={`
                  absolute -left-[3.25rem] md:-left-[4.25rem] top-0 w-10 h-10 md:w-12 md:h-12
                  rounded-full border-4 border-black flex items-center justify-center z-10
                  ${config.color}
                `}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>

                {/* Clickable Card */}
                <button
                  type="button"
                  onClick={handleCardClick}
                  className="w-full text-left"
                  disabled={!hasTx}
                >
                  <div className="bg-white border-2 border-black p-6 rounded-xl shadow-flat relative group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-80 disabled:cursor-default">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`
                          px-3 py-1 rounded-md border border-black text-xs font-black uppercase
                          ${config.color}
                        `}
                        >
                          {config.label}
                        </span>
                        <span className="text-sm font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(timestampMs, 'h:mm a')}
                        </span>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-1 md:gap-2">
                        <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(timestampMs, 'MMMM d, yyyy')}
                        </div>
                        {hasTx && entry.txHash && (
                          <span
                            className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200"
                            title={entry.txHash}
                          >
                            {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-6)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        {entry.notes && entry.notes.trim().length > 0 && (
                          <p className="font-bold text-lg text-black mb-2">
                            "{entry.notes}"
                          </p>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black uppercase text-slate-400">
                              Intensity
                            </span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-3 rounded-sm ${i < entry.intensity ? 'bg-black' : 'bg-slate-200'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-black border border-green-800">
                            +{entry.earned} FEELS
                          </div>
                        </div>
                      </div>
                    </div>

                    {hasTx && (
                      <p className="mt-3 text-[11px] text-slate-400 font-mono">
                        Click card to view transaction on Celo Sepolia explorer
                      </p>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
