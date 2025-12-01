import mongoose, { Schema, Document } from 'mongoose';
import { VALIDATION_RULES } from '../config/constants.js';

export interface IGameSession extends Document {
    walletAddress: string;
    gameId: string;
    score: number;
    timestamp: Date;
    txHash?: string;
}

const gameSessionSchema = new Schema<IGameSession>(
    {
        walletAddress: {
            type: String,
            required: [true, 'Wallet address is required'],
            trim: true,
            length: VALIDATION_RULES.WALLET_ADDRESS_LENGTH,
            index: true,
        },
        gameId: {
            type: String,
            required: [true, 'Game ID is required'],
            trim: true,
        },
        score: {
            type: Number,
            required: [true, 'Score is required'],
            min: [VALIDATION_RULES.MIN_SCORE, 'Score must be at least 0'],
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
        txHash: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: 'gamesessions',
    }
);

// Compound index for efficient queries
gameSessionSchema.index({ walletAddress: 1, timestamp: -1 });
gameSessionSchema.index({ gameId: 1, score: -1 });

export const GameSession = mongoose.model<IGameSession>('GameSession', gameSessionSchema);
