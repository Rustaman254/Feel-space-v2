import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    TrendingUp,
    Heart,
    Flame,
    Sun,
    Moon,
    Calendar,
    BarChart,
    Gamepad2,
    Download,
    AlertCircle,
} from 'lucide-react';
import { useWeb3 } from '@/hooks/use-web3';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { Link } from 'wouter';
import { InsightCard } from '@/components/analytics/InsightCard';
import { DistributionChart } from '@/components/analytics/DistributionChart';
import { EmotionChart } from '@/components/analytics/EmotionChart';
import { FullPageLoading } from '@/components/ui/loading';

const ICON_MAP: { [key: string]: any } = {
    Sparkles,
    TrendingUp,
    Heart,
    Flame,
    Sun,
    Moon,
    Calendar,
    BarChart,
    Gamepad2,
};

interface AnalyticsData {
    totalLogs: number;
    dateRange: { start: Date; end: Date };
    emotionDistribution: any[];
    timePatterns: any[];
    dayPatterns: any[];
    trends: any[];
    insights: any[];
    statistics: {
        mostCommonEmotion: string;
        averageIntensity: number;
        currentStreak: number;
        longestStreak: number;
        positivePercentage: number;
    };
}

export default function InsightsPage() {
    useEffect(() => {
        document.title = 'Feel Space | Insights';
    }, []);

    const { address, isConnected } = useWeb3();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(30);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!address || !isConnected) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await fetch(
                    API_ENDPOINTS.emotions.analytics(address, days)
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics');
                }

                const result = await response.json();
                setAnalytics(result.data);
            } catch (err: any) {
                console.error('Error fetching analytics:', err);
                setError(err.message || 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [address, isConnected, days]);

    const handleExport = () => {
        if (!analytics) return;

        const dataStr = JSON.stringify(analytics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `feel-space-analytics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

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
                        Connect your wallet to view your emotional insights.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return <FullPageLoading message="Loading Your Insights" subMessage="Analyzing your emotional patterns..." />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="bg-red-100 p-8 rounded-full border-4 border-red-200">
                    <AlertCircle className="w-16 h-16 text-red-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-black font-heading uppercase">Error Loading Data</h2>
                    <p className="text-slate-500 font-bold mt-2">{error}</p>
                </div>
            </div>
        );
    }

    if (!analytics || analytics.totalLogs === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="bg-slate-100 p-8 rounded-full border-4 border-slate-200">
                    <Sparkles className="w-16 h-16 text-slate-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-black font-heading uppercase">No Data Yet</h2>
                    <p className="text-slate-500 font-bold mt-2">
                        Start logging your emotions to see personalized insights!
                    </p>
                </div>
                <Link href="/">
                    <Button className="btn-flat bg-black text-white font-bold px-8 py-6">
                        Log First Emotion
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="border-b-2 border-black pb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-5xl font-heading font-black text-black uppercase tracking-tighter">
                            Your Insights
                        </h1>
                        <p className="text-xl font-bold text-slate-500 mt-2">
                            Understand your emotional patterns and make meaningful decisions.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="px-4 py-2 border-2 border-black rounded-lg font-bold bg-white shadow-flat-sm hover:shadow-none transition-all"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                        <Button
                            onClick={handleExport}
                            variant="outline"
                            className="btn-flat bg-white border-2 border-black font-bold"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-2 border-black rounded-xl p-4 shadow-flat"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart className="w-5 h-5 text-primary" />
                        <span className="text-xs font-black uppercase text-slate-500">Total Logs</span>
                    </div>
                    <p className="text-3xl font-black">{analytics.totalLogs}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border-2 border-black rounded-xl p-4 shadow-flat"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-xs font-black uppercase text-slate-500">Current Streak</span>
                    </div>
                    <p className="text-3xl font-black">{analytics.statistics.currentStreak}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border-2 border-black rounded-xl p-4 shadow-flat"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        <span className="text-xs font-black uppercase text-slate-500">Positive</span>
                    </div>
                    <p className="text-3xl font-black">{Math.round(analytics.statistics.positivePercentage)}%</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border-2 border-black rounded-xl p-4 shadow-flat"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-xs font-black uppercase text-slate-500">Avg Intensity</span>
                    </div>
                    <p className="text-3xl font-black">{analytics.statistics.averageIntensity.toFixed(1)}</p>
                </motion.div>
            </div>

            {/* Insights */}
            {analytics.insights.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-heading font-black uppercase">Key Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analytics.insights.map((insight, index) => (
                            <InsightCard
                                key={index}
                                type={insight.type}
                                title={insight.title}
                                description={insight.description}
                                icon={ICON_MAP[insight.icon] || Sparkles}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DistributionChart data={analytics.emotionDistribution} />
                <EmotionChart data={analytics.trends} />
            </div>

            {/* Time Patterns */}
            {analytics.timePatterns.length > 0 && (
                <div className="bg-white border-2 border-black rounded-xl p-6 shadow-flat">
                    <h3 className="font-heading font-black text-xl mb-4 uppercase">Time of Day Patterns</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {analytics.timePatterns.map((pattern) => (
                            <div
                                key={pattern.hour}
                                className="bg-slate-50 border-2 border-black rounded-lg p-3 text-center"
                            >
                                <p className="text-xs font-black text-slate-500 mb-1">
                                    {pattern.hour}:00
                                </p>
                                <p className="text-sm font-black capitalize">{pattern.dominantEmotion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Day Patterns */}
            {analytics.dayPatterns.length > 0 && (
                <div className="bg-white border-2 border-black rounded-xl p-6 shadow-flat">
                    <h3 className="font-heading font-black text-xl mb-4 uppercase">Day of Week Patterns</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {analytics.dayPatterns.map((pattern) => (
                            <div
                                key={pattern.day}
                                className="bg-slate-50 border-2 border-black rounded-lg p-3 text-center"
                            >
                                <p className="text-xs font-black text-slate-500 mb-1">{pattern.day}</p>
                                <p className="text-sm font-black capitalize">{pattern.dominantEmotion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
