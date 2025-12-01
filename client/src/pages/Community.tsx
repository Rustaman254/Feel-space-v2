import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    TrendingUp,
    Users,
    Flame,
    Heart,
    Zap,
    CloudRain,
    Sun,
    Smile,
    Frown,
    BatteryCharging,
    Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { useWeb3 } from '@/hooks/use-web3';
import { web3Service } from '@/lib/web3';

type FeedItem = {
    user: string;
    timestamp: number;
    emotionType: string;
    intensity: number;
    reward: number;
};

type LeaderboardItem = {
    user: string;
    feels: number;
    gamesPlayed: number;
    rank: number;
};

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

function shortAddress(addr: string) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Community() {
    useEffect(() => {
        document.title = 'Feel Space | Community';
    }, []);

    const { address, isConnected } = useWeb3();
    const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');

    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
    const [loadingFeed, setLoadingFeed] = useState(false);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoadingFeed(true);
                setLoadingLeaderboard(true);
                await web3Service.initialize();

                // Feed
                const rawFeed = await web3Service.getRecentPublicEmotions(20);
                const feedItems: FeedItem[] = rawFeed.map((f: any) => ({
                    user: f.user,
                    timestamp: Number(f.timestamp) * 1000,
                    emotionType: (f.emotionType as string).toLowerCase(),
                    intensity: Number(f.intensity),
                    reward: Number(f.reward) / 1e18,
                }));
                setFeed(feedItems);

                // Leaderboard
                const rawLb = await web3Service.getLeaderboard(20);
                const lbItems: LeaderboardItem[] = rawLb.map((e: any, idx: number) => ({
                    user: e.user,
                    feels: Number(e.feels) / 1e18,
                    gamesPlayed: Number(e.gamesPlayed),
                    rank: idx + 1,
                }));
                setLeaderboard(lbItems);
            } catch (e) {
                console.error('Error loading community data', e);
            } finally {
                setLoadingFeed(false);
                setLoadingLeaderboard(false);
            }
        };

        load();
    }, []);

    const userRank = address
        ? leaderboard.find(
            (entry) => entry.user.toLowerCase() === address.toLowerCase()
        )
        : undefined;

    const totalFeels =
        leaderboard.length > 0
            ? leaderboard.reduce((sum, e) => sum + e.feels, 0)
            : 0;

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
                            <p className="text-sm font-bold text-slate-500 uppercase">
                                Active Users
                            </p>
                            <p className="text-3xl font-heading font-black text-black">
                                {leaderboard.length || '—'}
                            </p>
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
                            <p className="text-sm font-bold text-slate-500 uppercase">
                                Emotions Logged
                            </p>
                            <p className="text-3xl font-heading font-black text-black">
                                {feed.length || '—'}
                            </p>
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
                            <p className="text-sm font-bold text-slate-500 uppercase">
                                Total FEELS
                            </p>
                            <p className="text-3xl font-heading font-black text-black">
                                {totalFeels ? `${(totalFeels / 1000).toFixed(1)}K` : '—'}
                            </p>
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

            {/* Feed */}
            {activeTab === 'feed' && (
                <div className="space-y-4">
                    {loadingFeed && (
                        <p className="text-sm text-slate-500">Loading community feed…</p>
                    )}
                    {!loadingFeed && feed.length === 0 && (
                        <p className="text-sm text-slate-500">
                            No emotions logged yet. Be the first to check in.
                        </p>
                    )}

                    {feed.map((entry, idx) => {
                        const config =
                            EMOTION_CONFIG[entry.emotionType] || EMOTION_CONFIG.happy;
                        const Icon = config.icon;
                        const isCurrentUser =
                            address && entry.user.toLowerCase() === address.toLowerCase();

                        return (
                            <motion.div
                                key={`${entry.user}-${entry.timestamp}-${idx}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white border-2 border-black p-6 rounded-xl shadow-flat hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${isCurrentUser ? 'ring-4 ring-accent' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div
                                            className={`p-3 ${config.color} border-2 border-black rounded-lg`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-mono font-bold text-sm">
                                                    {isCurrentUser ? 'You' : shortAddress(entry.user)}
                                                </span>
                                                {isCurrentUser && (
                                                    <span className="px-2 py-0.5 bg-accent text-black text-xs font-black border border-black rounded">
                                                        YOU
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span
                                                    className={`px-3 py-1 ${config.color} border border-black rounded-md text-xs font-black uppercase`}
                                                >
                                                    {config.label}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-black uppercase text-slate-400">
                                                        Intensity
                                                    </span>
                                                    <div className="flex gap-0.5">
                                                        {Array.from({ length: 10 }).map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-1.5 h-3 rounded-sm ${i < entry.intensity
                                                                        ? 'bg-black'
                                                                        : 'bg-slate-200'
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
                                            +{entry.reward.toFixed(2)} FEELS
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Leaderboard */}
            {activeTab === 'leaderboard' && (
                <div className="space-y-4">
                    {isConnected && userRank && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-accent to-yellow-200 border-4 border-black p-8 rounded-xl shadow-flat-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 opacity-10">
                                <Trophy className="w-32 h-32 text-black" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Trophy className="w-5 h-5 text-black" />
                                    <p className="text-sm font-bold uppercase text-black tracking-wider">
                                        Your Leaderboard Position
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 bg-black text-accent border-4 border-black rounded-2xl flex items-center justify-center shadow-flat">
                                                <span className="text-4xl font-heading font-black">
                                                    #{userRank.rank}
                                                </span>
                                            </div>
                                            {userRank.rank <= 3 && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center">
                                                    <Trophy className="w-4 h-4 text-black" />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-2xl font-heading font-black text-black mb-1">
                                                You
                                            </p>
                                            <p className="text-sm font-bold text-black/70 mb-1">
                                                {userRank.gamesPlayed} games played
                                            </p>
                                            <p className="text-xs font-bold text-black/60">
                                                {userRank.rank === 1
                                                    ? "🎉 You're #1!"
                                                    : userRank.rank <= 3
                                                        ? '🏆 Top 3 position!'
                                                        : userRank.rank <= 10
                                                            ? '⭐ Top 10 position!'
                                                            : `Out of ${leaderboard.length} players`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right bg-black/10 px-6 py-4 rounded-xl border-2 border-black">
                                        <p className="text-4xl font-heading font-black text-black leading-none mb-1">
                                            {userRank.feels.toFixed(2)}
                                        </p>
                                        <p className="text-xs font-bold uppercase text-black/70">
                                            FEELS Earned
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="bg-white border-2 border-black rounded-xl shadow-flat overflow-hidden">
                        <div className="bg-black text-white p-4 flex items-center gap-3">
                            <Trophy className="w-6 h-6" />
                            <h2 className="text-xl font-heading font-black uppercase">
                                Top Earners
                            </h2>
                        </div>
                        {loadingLeaderboard ? (
                            <p className="p-4 text-sm text-slate-500">Loading leaderboard…</p>
                        ) : (
                            <div className="divide-y-2 divide-black">
                                {leaderboard.map((entry) => {
                                    const isCurrentUser =
                                        address &&
                                        entry.user.toLowerCase() === address.toLowerCase();
                                    const isTopThree = entry.rank <= 3;

                                    return (
                                        <motion.div
                                            key={entry.user}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: (entry.rank - 1) * 0.03 }}
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
                                                        {isCurrentUser ? 'You' : shortAddress(entry.user)}
                                                        {isCurrentUser && (
                                                            <span className="px-2 py-0.5 bg-accent text-black text-xs font-black border border-black rounded">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-500">
                                                        {entry.gamesPlayed} games played
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-heading font-black text-black">
                                                    {entry.feels.toFixed(2)}
                                                </p>
                                                <p className="text-xs font-bold uppercase text-slate-500">
                                                    FEELS
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
