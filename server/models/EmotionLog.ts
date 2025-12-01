import mongoose, { Schema, Document } from 'mongoose';
import { VALIDATION_RULES } from '../config/constants.js';

export interface IEmotionLog extends Document {
    walletAddress: string;
    emotion: string;
    intensity: number;
    notes: string;
    timestamp: Date;
    txHash?: string;
    earned: number;
}

const emotionLogSchema = new Schema<IEmotionLog>(
    {
        walletAddress: {
            type: String,
            required: [true, 'Wallet address is required'],
            trim: true,
            length: VALIDATION_RULES.WALLET_ADDRESS_LENGTH,
            index: true,
        },
        emotion: {
            type: String,
            required: [true, 'Emotion is required'],
            trim: true,
        },
        intensity: {
            type: Number,
            required: [true, 'Intensity is required'],
            min: [VALIDATION_RULES.MIN_INTENSITY, 'Intensity must be at least 1'],
            max: [VALIDATION_RULES.MAX_INTENSITY, 'Intensity must be at most 10'],
        },
        notes: {
            type: String,
            required: false,
            default: '',
            maxlength: [VALIDATION_RULES.MAX_NOTES_LENGTH, 'Notes must be at most 500 characters'],
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
        earned: {
            type: Number,
            default: 10,
            min: 0,
        },
    },
    {
        timestamps: true,
        collection: 'emotionlogs',
    }
);

// Compound index for efficient queries
emotionLogSchema.index({ walletAddress: 1, timestamp: -1 });

export const EmotionLog = mongoose.model<IEmotionLog>('EmotionLog', emotionLogSchema);
