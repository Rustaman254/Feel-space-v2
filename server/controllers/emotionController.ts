import { Request, Response } from 'express';
import { EmotionLog } from '../models/EmotionLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

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
