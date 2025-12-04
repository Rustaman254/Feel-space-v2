import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface TrendData {
    period: string;
    emotion: string;
    avgIntensity: number;
    count: number;
}

interface EmotionChartProps {
    data: TrendData[];
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

export function EmotionChart({ data }: EmotionChartProps) {
    if (data.length === 0) {
        return (
            <div className="bg-white border-2 border-black rounded-xl p-8 shadow-flat text-center">
                <p className="text-slate-400 font-bold">No trend data available</p>
            </div>
        );
    }

    // Transform data for recharts
    const chartData = data.reduce((acc, item) => {
        const existing = acc.find((d) => d.period === item.period);
        if (existing) {
            existing[item.emotion] = item.avgIntensity;
        } else {
            acc.push({
                period: item.period,
                [item.emotion]: item.avgIntensity,
            });
        }
        return acc;
    }, [] as any[]);

    // Get unique emotions
    const emotions = [...new Set(data.map((d) => d.emotion))];

    return (
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-flat">
            <h3 className="font-heading font-black text-xl mb-4 uppercase">Emotion Trends</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                            dataKey="period"
                            tickFormatter={(value) => format(new Date(value), 'MMM d')}
                            style={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <YAxis
                            domain={[0, 10]}
                            style={{ fontSize: '12px', fontWeight: 'bold' }}
                            label={{ value: 'Intensity', angle: -90, position: 'insideLeft', style: { fontWeight: 'bold' } }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '2px solid black',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                            }}
                            labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                        />
                        <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }} />
                        {emotions.map((emotion) => (
                            <Line
                                key={emotion}
                                type="monotone"
                                dataKey={emotion}
                                stroke={EMOTION_COLORS[emotion] || '#CBD5E1'}
                                strokeWidth={3}
                                dot={{ fill: EMOTION_COLORS[emotion], strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
