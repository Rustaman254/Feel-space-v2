import React from 'react';
import { motion } from 'framer-motion';

interface EmotionDistribution {
    emotion: string;
    count: number;
    percentage: number;
    avgIntensity: number;
}

interface DistributionChartProps {
    data: EmotionDistribution[];
}

const EMOTION_COLORS: { [key: string]: string } = {
    happy: '#FFE500',
    excited: '#FB923C',
    grateful: '#F472B6',
    calm: '#FEF08A',
    tired: '#CBD5E1',
    anxious: '#8B5CF6',
    sad: '#3B82F6',
    angry: '#EF4444',
};

export function DistributionChart({ data }: DistributionChartProps) {
    if (data.length === 0) {
        return (
            <div className="bg-white border-2 border-black rounded-xl p-8 shadow-flat text-center">
                <p className="text-slate-400 font-bold">No emotion data available</p>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-flat">
            <h3 className="font-heading font-black text-xl mb-4 uppercase">Emotion Distribution</h3>

            {/* Horizontal Bar Chart */}
            <div className="space-y-3 mb-6">
                {data.map((item, index) => (
                    <motion.div
                        key={item.emotion}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-1"
                    >
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-black uppercase">{item.emotion}</span>
                            <span className="font-bold text-slate-600">{Math.round(item.percentage)}%</span>
                        </div>
                        <div className="h-8 bg-slate-100 border-2 border-black rounded-lg overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="h-full border-r-2 border-black flex items-center justify-end pr-2"
                                style={{ backgroundColor: EMOTION_COLORS[item.emotion] || '#CBD5E1' }}
                            >
                                <span className="text-xs font-black text-black">{item.count}</span>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t-2 border-black">
                <p className="text-xs font-bold text-slate-500 mb-2">Total Logs: {total}</p>
                <div className="grid grid-cols-2 gap-2">
                    {data.slice(0, 4).map((item) => (
                        <div key={item.emotion} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-sm border border-black"
                                style={{ backgroundColor: EMOTION_COLORS[item.emotion] }}
                            />
                            <span className="text-xs font-bold capitalize">{item.emotion}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
