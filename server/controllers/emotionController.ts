import { Request, Response } from 'express';
import { EmotionLog } from '../models/EmotionLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { analyticsService } from '../services/analytics.js';

export const logEmotion = asyncHandler(async (req: Request, res: Response) => {
    const emotionLog = await EmotionLog.create(req.body);

    logger.info('Emotion logged successfully', {
        walletAddress: emotionLog.walletAddress,
        emotion: emotionLog.emotion,
    });

    res.status(201).json({
        success: true,
        data: emotionLog,
    });
});

export const getEmotionHistory = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;

    const history = await EmotionLog.find({ walletAddress })
        .sort({ timestamp: -1 })
        .lean();

    res.status(200).json({
        success: true,
        count: history.length,
        data: history,
    });
});

export const getEmotionAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const analytics = await analyticsService.getAnalytics(walletAddress, days);

    logger.info('Analytics retrieved successfully', {
        walletAddress,
        totalLogs: analytics.totalLogs,
    });

    res.status(200).json({
        success: true,
        data: analytics,
    });
});

export const getEmotionInsights = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const analytics = await analyticsService.getAnalytics(walletAddress, days);

    res.status(200).json({
        success: true,
        data: {
            insights: analytics.insights,
            statistics: analytics.statistics,
        },
    });
});

export const getEmotionTrends = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const analytics = await analyticsService.getAnalytics(walletAddress, days);

    res.status(200).json({
        success: true,
        data: {
            trends: analytics.trends,
            emotionDistribution: analytics.emotionDistribution,
            timePatterns: analytics.timePatterns,
            dayPatterns: analytics.dayPatterns,
        },
    });
});
