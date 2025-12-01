import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, Flame, Heart, Zap, CloudRain, Sun, Smile, Frown, BatteryCharging, Calendar } from 'lucide-react';
import { useWeb3 } from '@/hooks/use-web3';
import { format } from 'date-fns';

// Mock data for community feed (will be replaced with real on-chain data)
const MOCK_COMMUNITY_FEED = [
    { address: '0x1234...5678', emotion: 'happy', intensity: 8, timestamp: Date.now() - 300000, earned: 10 },
    { address: '0xabcd...efgh', emotion: 'excited', intensity: 9, timestamp: Date.now() - 600000, earned: 10 },
    { address: '0x9876...5432', emotion: 'calm', intensity: 7, timestamp: Date.now() - 900000, earned: 10 },
    { address: '0xfedc...ba98', emotion: 'grateful', intensity: 10, timestamp: Date.now() - 1200000, earned: 10 },
    { address: '0x1111...2222', emotion: 'anxious', intensity: 6, timestamp: Date.now() - 1500000, earned: 10 },
];

// Mock leaderboard data
const MOCK_LEADERBOARD = [
    { address: '0x1234...5678', feels: 1250, gamesPlayed: 45, rank: 1 },
    { address: '0xabcd...efgh', feels: 980, gamesPlayed: 38, rank: 2 },
    { address: '0x9876...5432', feels: 875, gamesPlayed: 32, rank: 3 },
    { address: '0xfedc...ba98', feels: 720, gamesPlayed: 28, rank: 4 },
    { address: '0x1111...2222', feels: 650, gamesPlayed: 25, rank: 5 },
    { address: '0x3333...4444', feels: 580, gamesPlayed: 22, rank: 6 },
    { address: '0x5555...6666', feels: 490, gamesPlayed: 19, rank: 7 },
    { address: '0x7777...8888', feels: 420, gamesPlayed: 16, rank: 8 },
    { address: '0x9999...aaaa', feels: 350, gamesPlayed: 14, rank: 9 },
    { address: '0xbbbb...cccc', feels: 280, gamesPlayed: 11, rank: 10 },
];

const EMOTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    happy: { icon: Smile, color: 'bg-accent text-black', label: 'Happy' },
    excited: { icon: Flame, color: 'bg-orange-400 text-black', label: 'Excited' },
    grateful: { icon: Heart, color: 'bg-pink-400 text-white', label: 'Grateful' },
    calm: { icon: Sun, color: 'bg-yellow-200 text-yellow-800', label: 'Calm' },
    tired: { icon: BatteryCharging, color: 'bg-slate-300 text-slate-600', label: 'Tired' },
    anxious: { icon: Zap, color: 'bg-primary text-white', label: 'Anxious' },
    sad: { icon: CloudRain, color: 'bg-secondary text-white', label: 'Sad' },
    angry: { icon: Frown, color: 'bg-destructive text-white', label: 'Frustrated' },
};

export default function Community() {
    useEffect(() => {
        document.title = 'Feel Space | Community';
    }, []);

    const { address, isConnected } = useWeb3();
    const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');

    // Find current user's rank
    const userRank = MOCK_LEADERBOARD.find(
        (entry) => address && entry.address.toLowerCase().includes(address.slice(2, 6).toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="border-b-2 border-black pb-6">
                <h1 className="text-5xl font-heading font-black text-black uppercase tracking-tighter">
                    Community
                </h1>
                <p className="text-xl font-bold text-slate-500 mt-2">
                    Connect with others on their emotional journey.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border-2 border-black p-6 rounded-xl shadow-flat"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary border-2 border-black rounded-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase">Active Users</p>
                            <p className="text-3xl font-heading font-black text-black">1,234</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border-2 border-black p-6 rounded-xl shadow-flat"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent border-2 border-black rounded-lg">
                            <TrendingUp className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase">Emotions Logged</p>
                            <p className="text-3xl font-heading font-black text-black">45.6K</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border-2 border-black p-6 rounded-xl shadow-flat"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary border-2 border-black rounded-lg">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase">Total FEELS</p>
                            <p className="text-3xl font-heading font-black text-black">892K</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b-2 border-black">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`px-6 py-3 font-bold border-2 border-black rounded-t-lg transition-all ${activeTab === 'feed'
                        ? 'bg-black text-white -mb-[2px]'
                        : 'bg-white text-black hover:bg-slate-50'
                        }`}
                >
                    Community Feed
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-6 py-3 font-bold border-2 border-black rounded-t-lg transition-all ${activeTab === 'leaderboard'
                        ? 'bg-black text-white -mb-[2px]'
                        : 'bg-white text-black hover:bg-slate-50'
                        }`}
                >
                    Leaderboard
                </button>
            </div>

            {/* Content */}
            {activeTab === 'feed' && (
                <div className="space-y-4">
                    {MOCK_COMMUNITY_FEED.map((entry, idx) => {
                        const config = EMOTION_CONFIG[entry.emotion] || EMOTION_CONFIG.happy;
                        const Icon = config.icon;
                        const isCurrentUser = address && entry.address.toLowerCase().includes(address.slice(2, 6).toLowerCase());

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white border-2 border-black p-6 rounded-xl shadow-flat hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${isCurrentUser ? 'ring-4 ring-accent' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 ${config.color} border-2 border-black rounded-lg`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-mono font-bold text-sm">
                                                    {isCurrentUser ? 'You' : entry.address}
                                                </span>
                                                {isCurrentUser && (
                                                    <span className="px-2 py-0.5 bg-accent text-black text-xs font-black border border-black rounded">
                                                        YOU
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={`px-3 py-1 ${config.color} border border-black rounded-md text-xs font-black uppercase`}>
                                                    {config.label}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-black uppercase text-slate-400">Intensity</span>
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
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1 justify-end mb-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(entry.timestamp, 'h:mm a')}
                                        </div>
                                        <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-black border border-green-800">
                                            +{entry.earned} FEELS
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'leaderboard' && (
                <div className="space-y-4">
                    {/* Current User Rank (if connected) */}
                    {isConnected && userRank && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-accent to-yellow-200 border-4 border-black p-8 rounded-xl shadow-flat-lg relative overflow-hidden"
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 opacity-10">
                                <Trophy className="w-32 h-32 text-black" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Trophy className="w-5 h-5 text-black" />
                                    <p className="text-sm font-bold uppercase text-black tracking-wider">Your Leaderboard Position</p>
                                </div>

                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        {/* Large Rank Badge */}
                                        <div className="relative">
                                            <div className="w-20 h-20 bg-black text-accent border-4 border-black rounded-2xl flex items-center justify-center shadow-flat">
                                                <span className="text-4xl font-heading font-black">#{userRank.rank}</span>
                                            </div>
                                            {userRank.rank <= 3 && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center">
                                                    <Trophy className="w-4 h-4 text-black" />
                                                </div>
                                            )}
                                        </div>

                                        {/* User Info */}
                                        <div>
                                            <p className="text-2xl font-heading font-black text-black mb-1">You</p>
                                            <p className="text-sm font-bold text-black/70 mb-1">
                                                {userRank.gamesPlayed} games played
                                            </p>
                                            <p className="text-xs font-bold text-black/60">
                                                {userRank.rank === 1
                                                    ? '🎉 You\'re #1!'
                                                    : userRank.rank <= 3
                                                        ? '🏆 Top 3 position!'
                                                        : userRank.rank <= 10
                                                            ? '⭐ Top 10 position!'
                                                            : `Out of ${MOCK_LEADERBOARD.length}+ players`
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* FEELS Display */}
                                    <div className="text-right bg-black/10 px-6 py-4 rounded-xl border-2 border-black">
                                        <p className="text-4xl font-heading font-black text-black leading-none mb-1">
                                            {userRank.feels}
                                        </p>
                                        <p className="text-xs font-bold uppercase text-black/70">FEELS Earned</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Leaderboard */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-flat overflow-hidden">
                        <div className="bg-black text-white p-4 flex items-center gap-3">
                            <Trophy className="w-6 h-6" />
                            <h2 className="text-xl font-heading font-black uppercase">Top Earners</h2>
                        </div>
                        <div className="divide-y-2 divide-black">
                            {MOCK_LEADERBOARD.map((entry, idx) => {
                                const isCurrentUser = address && entry.address.toLowerCase().includes(address.slice(2, 6).toLowerCase());
                                const isTopThree = entry.rank <= 3;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${isCurrentUser ? 'bg-accent/20' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 flex items-center justify-center border-2 border-black rounded-lg font-heading font-black text-lg ${isTopThree
                                                    ? entry.rank === 1
                                                        ? 'bg-yellow-400 text-black'
                                                        : entry.rank === 2
                                                            ? 'bg-slate-300 text-black'
                                                            : 'bg-orange-400 text-black'
                                                    : 'bg-white text-black'
                                                    }`}
                                            >
                                                {entry.rank}
                                            </div>
                                            <div>
                                                <p className="font-mono font-bold text-sm flex items-center gap-2">
                                                    {isCurrentUser ? 'You' : entry.address}
                                                    {isCurrentUser && (
                                                        <span className="px-2 py-0.5 bg-accent text-black text-xs font-black border border-black rounded">
                                                            YOU
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs font-bold text-slate-500">{entry.gamesPlayed} games played</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-heading font-black text-black">{entry.feels}</p>
                                            <p className="text-xs font-bold uppercase text-slate-500">FEELS</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
