import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
    type: 'pattern' | 'trend' | 'recommendation' | 'achievement';
    title: string;
    description: string;
    icon: LucideIcon;
    index?: number;
}

const typeColors = {
    pattern: 'bg-blue-100 border-blue-400 text-blue-800',
    trend: 'bg-green-100 border-green-400 text-green-800',
    recommendation: 'bg-purple-100 border-purple-400 text-purple-800',
    achievement: 'bg-orange-100 border-orange-400 text-orange-800',
};

const typeIcons = {
    pattern: 'bg-blue-400',
    trend: 'bg-green-400',
    recommendation: 'bg-purple-400',
    achievement: 'bg-orange-400',
};

export function InsightCard({ type, title, description, icon: Icon, index = 0 }: InsightCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border-2 border-black shadow-flat ${typeColors[type]}`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border-2 border-black ${typeIcons[type]}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-black text-sm mb-1 uppercase tracking-tight">{title}</h3>
                    <p className="text-xs font-bold leading-relaxed">{description}</p>
                </div>
            </div>
        </motion.div>
    );
}
