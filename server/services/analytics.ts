import { EmotionLog, IEmotionLog } from '../models/EmotionLog.js';

interface EmotionDistribution {
    emotion: string;
    count: number;
    percentage: number;
    avgIntensity: number;
}

interface TimePattern {
    hour: number;
    emotions: { [emotion: string]: number };
    dominantEmotion: string;
}

interface DayPattern {
    day: string;
    emotions: { [emotion: string]: number };
    dominantEmotion: string;
}

interface TrendData {
    period: string;
    emotion: string;
    avgIntensity: number;
    count: number;
}

interface Insight {
    type: 'pattern' | 'trend' | 'recommendation' | 'achievement';
    title: string;
    description: string;
    icon: string;
    priority: number;
}

export interface AnalyticsData {
    totalLogs: number;
    dateRange: { start: Date; end: Date };
    emotionDistribution: EmotionDistribution[];
    timePatterns: TimePattern[];
    dayPatterns: DayPattern[];
    trends: TrendData[];
    insights: Insight[];
    statistics: {
        mostCommonEmotion: string;
        averageIntensity: number;
        currentStreak: number;
        longestStreak: number;
        positivePercentage: number;
    };
}

export class AnalyticsService {
    private readonly POSITIVE_EMOTIONS = ['happy', 'excited', 'grateful', 'calm'];
    private readonly NEGATIVE_EMOTIONS = ['anxious', 'sad', 'angry'];
    private readonly NEUTRAL_EMOTIONS = ['tired'];

    /**
     * Get comprehensive analytics for a user's emotion history
     */
    async getAnalytics(walletAddress: string, days: number = 30): Promise<AnalyticsData> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const logs = await EmotionLog.find({
            walletAddress,
            timestamp: { $gte: startDate },
        })
            .sort({ timestamp: -1 })
            .lean();

        if (logs.length === 0) {
            return this.getEmptyAnalytics();
        }

        const emotionDistribution = this.calculateEmotionDistribution(logs);
        const timePatterns = this.detectTimePatterns(logs);
        const dayPatterns = this.detectDayPatterns(logs);
        const trends = this.calculateTrends(logs);
        const statistics = this.calculateStatistics(logs, emotionDistribution);
        const insights = this.generateInsights(logs, emotionDistribution, timePatterns, dayPatterns, statistics);

        return {
            totalLogs: logs.length,
            dateRange: {
                start: startDate,
                end: new Date(),
            },
            emotionDistribution,
            timePatterns,
            dayPatterns,
            trends,
            insights,
            statistics,
        };
    }

    /**
     * Calculate emotion distribution
     */
    private calculateEmotionDistribution(logs: IEmotionLog[]): EmotionDistribution[] {
        const emotionMap = new Map<string, { count: number; totalIntensity: number }>();

        logs.forEach((log) => {
            const current = emotionMap.get(log.emotion) || { count: 0, totalIntensity: 0 };
            emotionMap.set(log.emotion, {
                count: current.count + 1,
                totalIntensity: current.totalIntensity + log.intensity,
            });
        });

        const distribution: EmotionDistribution[] = [];
        emotionMap.forEach((value, emotion) => {
            distribution.push({
                emotion,
                count: value.count,
                percentage: (value.count / logs.length) * 100,
                avgIntensity: value.totalIntensity / value.count,
            });
        });

        return distribution.sort((a, b) => b.count - a.count);
    }

    /**
     * Detect time-of-day patterns
     */
    private detectTimePatterns(logs: IEmotionLog[]): TimePattern[] {
        const hourMap = new Map<number, Map<string, number>>();

        logs.forEach((log) => {
            const hour = new Date(log.timestamp).getHours();
            if (!hourMap.has(hour)) {
                hourMap.set(hour, new Map());
            }
            const emotionMap = hourMap.get(hour)!;
            emotionMap.set(log.emotion, (emotionMap.get(log.emotion) || 0) + 1);
        });

        const patterns: TimePattern[] = [];
        hourMap.forEach((emotions, hour) => {
            const emotionObj: { [key: string]: number } = {};
            let maxCount = 0;
            let dominantEmotion = '';

            emotions.forEach((count, emotion) => {
                emotionObj[emotion] = count;
                if (count > maxCount) {
                    maxCount = count;
                    dominantEmotion = emotion;
                }
            });

            patterns.push({
                hour,
                emotions: emotionObj,
                dominantEmotion,
            });
        });

        return patterns.sort((a, b) => a.hour - b.hour);
    }

    /**
     * Detect day-of-week patterns
     */
    private detectDayPatterns(logs: IEmotionLog[]): DayPattern[] {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayMap = new Map<string, Map<string, number>>();

        logs.forEach((log) => {
            const day = dayNames[new Date(log.timestamp).getDay()];
            if (!dayMap.has(day)) {
                dayMap.set(day, new Map());
            }
            const emotionMap = dayMap.get(day)!;
            emotionMap.set(log.emotion, (emotionMap.get(log.emotion) || 0) + 1);
        });

        const patterns: DayPattern[] = [];
        dayMap.forEach((emotions, day) => {
            const emotionObj: { [key: string]: number } = {};
            let maxCount = 0;
            let dominantEmotion = '';

            emotions.forEach((count, emotion) => {
                emotionObj[emotion] = count;
                if (count > maxCount) {
                    maxCount = count;
                    dominantEmotion = emotion;
                }
            });

            patterns.push({
                day,
                emotions: emotionObj,
                dominantEmotion,
            });
        });

        return patterns;
    }

    /**
     * Calculate trends over time
     */
    private calculateTrends(logs: IEmotionLog[]): TrendData[] {
        // Group by week
        const weekMap = new Map<string, Map<string, { totalIntensity: number; count: number }>>();

        logs.forEach((log) => {
            const date = new Date(log.timestamp);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];

            if (!weekMap.has(weekKey)) {
                weekMap.set(weekKey, new Map());
            }
            const emotionMap = weekMap.get(weekKey)!;
            const current = emotionMap.get(log.emotion) || { totalIntensity: 0, count: 0 };
            emotionMap.set(log.emotion, {
                totalIntensity: current.totalIntensity + log.intensity,
                count: current.count + 1,
            });
        });

        const trends: TrendData[] = [];
        weekMap.forEach((emotions, period) => {
            emotions.forEach((data, emotion) => {
                trends.push({
                    period,
                    emotion,
                    avgIntensity: data.totalIntensity / data.count,
                    count: data.count,
                });
            });
        });

        return trends.sort((a, b) => a.period.localeCompare(b.period));
    }

    /**
     * Calculate statistics
     */
    private calculateStatistics(
        logs: IEmotionLog[],
        distribution: EmotionDistribution[]
    ): AnalyticsData['statistics'] {
        const mostCommonEmotion = distribution[0]?.emotion || 'none';
        const totalIntensity = logs.reduce((sum, log) => sum + log.intensity, 0);
        const averageIntensity = totalIntensity / logs.length;

        // Calculate positive percentage
        const positiveCount = logs.filter((log) => this.POSITIVE_EMOTIONS.includes(log.emotion)).length;
        const positivePercentage = (positiveCount / logs.length) * 100;

        // Calculate streaks
        const { currentStreak, longestStreak } = this.calculateStreaks(logs);

        return {
            mostCommonEmotion,
            averageIntensity,
            currentStreak,
            longestStreak,
            positivePercentage,
        };
    }

    /**
     * Calculate current and longest streaks
     */
    private calculateStreaks(logs: IEmotionLog[]): { currentStreak: number; longestStreak: number } {
        if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 };

        const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        let currentStreak = 1;
        let longestStreak = 1;
        let tempStreak = 1;

        for (let i = 1; i < sortedLogs.length; i++) {
            const prevDate = new Date(sortedLogs[i - 1].timestamp);
            const currDate = new Date(sortedLogs[i].timestamp);

            const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else if (dayDiff > 1) {
                tempStreak = 1;
            }
        }

        // Calculate current streak from most recent log
        const today = new Date();
        const lastLog = new Date(sortedLogs[sortedLogs.length - 1].timestamp);
        const daysSinceLastLog = Math.floor((today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceLastLog <= 1) {
            currentStreak = tempStreak;
        } else {
            currentStreak = 0;
        }

        return { currentStreak, longestStreak };
    }

    /**
     * Generate personalized insights
     */
    private generateInsights(
        logs: IEmotionLog[],
        distribution: EmotionDistribution[],
        timePatterns: TimePattern[],
        dayPatterns: DayPattern[],
        statistics: AnalyticsData['statistics']
    ): Insight[] {
        const insights: Insight[] = [];

        // Achievement insights
        if (statistics.currentStreak >= 7) {
            insights.push({
                type: 'achievement',
                title: `${statistics.currentStreak}-Day Streak! 🔥`,
                description: `You've been consistently tracking your emotions for ${statistics.currentStreak} days. Keep it up!`,
                icon: 'Flame',
                priority: 1,
            });
        }

        // Positive trend insight
        if (statistics.positivePercentage >= 60) {
            insights.push({
                type: 'trend',
                title: 'Positive Momentum',
                description: `${Math.round(statistics.positivePercentage)}% of your recent emotions have been positive. You're doing great!`,
                icon: 'TrendingUp',
                priority: 2,
            });
        } else if (statistics.positivePercentage < 40) {
            insights.push({
                type: 'recommendation',
                title: 'Self-Care Reminder',
                description: 'Your mood has been lower recently. Consider playing calming games or reaching out to someone you trust.',
                icon: 'Heart',
                priority: 1,
            });
        }

        // Time pattern insights
        const morningPattern = timePatterns.find((p) => p.hour >= 6 && p.hour <= 9);
        const eveningPattern = timePatterns.find((p) => p.hour >= 18 && p.hour <= 21);

        if (morningPattern && this.NEGATIVE_EMOTIONS.includes(morningPattern.dominantEmotion)) {
            insights.push({
                type: 'pattern',
                title: 'Morning Mood Pattern',
                description: `You tend to feel ${morningPattern.dominantEmotion} in the mornings. Try starting your day with a breathing exercise.`,
                icon: 'Sun',
                priority: 3,
            });
        }

        if (eveningPattern && this.NEGATIVE_EMOTIONS.includes(eveningPattern.dominantEmotion)) {
            insights.push({
                type: 'pattern',
                title: 'Evening Mood Pattern',
                description: `Your evenings often feel ${eveningPattern.dominantEmotion}. Consider a relaxing game before bed.`,
                icon: 'Moon',
                priority: 3,
            });
        }

        // Day pattern insights
        const stressfulDay = dayPatterns.find((p) => this.NEGATIVE_EMOTIONS.includes(p.dominantEmotion));
        if (stressfulDay) {
            insights.push({
                type: 'pattern',
                title: `${stressfulDay.day} Pattern`,
                description: `You tend to feel ${stressfulDay.dominantEmotion} on ${stressfulDay.day}s. Plan something enjoyable for this day.`,
                icon: 'Calendar',
                priority: 4,
            });
        }

        // Most common emotion insight
        if (distribution.length > 0) {
            const topEmotion = distribution[0];
            if (topEmotion.percentage > 30) {
                insights.push({
                    type: 'pattern',
                    title: 'Dominant Emotion',
                    description: `You've been feeling ${topEmotion.emotion} ${Math.round(topEmotion.percentage)}% of the time recently.`,
                    icon: 'BarChart',
                    priority: 5,
                });
            }
        }

        // Recommendation based on most common negative emotion
        const topNegative = distribution.find((d) => this.NEGATIVE_EMOTIONS.includes(d.emotion));
        if (topNegative && topNegative.percentage > 20) {
            const gameRecommendation = this.getGameRecommendation(topNegative.emotion);
            insights.push({
                type: 'recommendation',
                title: 'Game Recommendation',
                description: `Try playing ${gameRecommendation} to help manage feelings of ${topNegative.emotion}.`,
                icon: 'Gamepad2',
                priority: 2,
            });
        }

        return insights.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Get game recommendation based on emotion
     */
    private getGameRecommendation(emotion: string): string {
        const recommendations: { [key: string]: string } = {
            anxious: 'Bubble Pop or Breathing exercises',
            sad: 'Bubble Pop or Mood Journal',
            angry: 'Bubble Pop for stress relief',
            tired: 'Breathing exercises',
        };
        return recommendations[emotion] || 'Mind Match';
    }

    /**
     * Return empty analytics for users with no data
     */
    private getEmptyAnalytics(): AnalyticsData {
        return {
            totalLogs: 0,
            dateRange: { start: new Date(), end: new Date() },
            emotionDistribution: [],
            timePatterns: [],
            dayPatterns: [],
            trends: [],
            insights: [
                {
                    type: 'recommendation',
                    title: 'Start Your Journey',
                    description: 'Log your first emotion to begin tracking patterns and receiving personalized insights!',
                    icon: 'Sparkles',
                    priority: 1,
                },
            ],
            statistics: {
                mostCommonEmotion: 'none',
                averageIntensity: 0,
                currentStreak: 0,
                longestStreak: 0,
                positivePercentage: 0,
            },
        };
    }
}

export const analyticsService = new AnalyticsService();
