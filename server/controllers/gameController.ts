import { Request, Response } from 'express';
import { GameSession } from '../models/GameSession.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const completeGame = asyncHandler(async (req: Request, res: Response) => {
    const gameSession = await GameSession.create(req.body);

    logger.info('Game session recorded successfully', {
        walletAddress: gameSession.walletAddress,
        gameId: gameSession.gameId,
        score: gameSession.score,
    });

    res.status(201).json({
        success: true,
        data: gameSession,
    });
});

export const getGameHistory = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;

    const history = await GameSession.find({ walletAddress })
        .sort({ timestamp: -1 })
        .lean();

    res.status(200).json({
        success: true,
        count: history.length,
        data: history,
    });
});
