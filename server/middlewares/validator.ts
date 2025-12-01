import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { VALIDATION_RULES } from '../config/constants.js';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg).join(', ');
        throw ApiError.badRequest(errorMessages);
    }
    next();
};

export const validateEmotionLog = [
    body('walletAddress')
        .isString()
        .trim()
        .isLength({ min: VALIDATION_RULES.WALLET_ADDRESS_LENGTH, max: VALIDATION_RULES.WALLET_ADDRESS_LENGTH })
        .withMessage(`Wallet address must be exactly ${VALIDATION_RULES.WALLET_ADDRESS_LENGTH} characters`),
    body('emotion')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Emotion is required'),
    body('intensity')
        .isInt({ min: VALIDATION_RULES.MIN_INTENSITY, max: VALIDATION_RULES.MAX_INTENSITY })
        .withMessage(`Intensity must be between ${VALIDATION_RULES.MIN_INTENSITY} and ${VALIDATION_RULES.MAX_INTENSITY}`),
    body('notes')
        .optional()
        .isString()
        .trim()
        .isLength({ max: VALIDATION_RULES.MAX_NOTES_LENGTH })
        .withMessage(`Notes must be at most ${VALIDATION_RULES.MAX_NOTES_LENGTH} characters`),
    body('txHash')
        .optional()
        .isString()
        .trim(),
    body('earned')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Earned must be a positive number'),
    validate,
];

export const validateGameSession = [
    body('walletAddress')
        .isString()
        .trim()
        .isLength({ min: VALIDATION_RULES.WALLET_ADDRESS_LENGTH, max: VALIDATION_RULES.WALLET_ADDRESS_LENGTH })
        .withMessage(`Wallet address must be exactly ${VALIDATION_RULES.WALLET_ADDRESS_LENGTH} characters`),
    body('gameId')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Game ID is required'),
    body('score')
        .isInt({ min: VALIDATION_RULES.MIN_SCORE })
        .withMessage(`Score must be at least ${VALIDATION_RULES.MIN_SCORE}`),
    body('txHash')
        .optional()
        .isString()
        .trim(),
    validate,
];

export const validateWalletAddress = [
    param('walletAddress')
        .isString()
        .trim()
        .isLength({ min: VALIDATION_RULES.WALLET_ADDRESS_LENGTH, max: VALIDATION_RULES.WALLET_ADDRESS_LENGTH })
        .withMessage(`Wallet address must be exactly ${VALIDATION_RULES.WALLET_ADDRESS_LENGTH} characters`),
    validate,
];
