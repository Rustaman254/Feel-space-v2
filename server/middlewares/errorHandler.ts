import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error = err;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map((e: any) => e.message)
            .join(', ');
        error = ApiError.badRequest(message);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = ApiError.badRequest(message);
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}`;
        error = ApiError.badRequest(message);
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Log error
    logger.error('Error occurred:', {
        statusCode,
        message,
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
    });

    res.status(statusCode).json({
        success: false,
        message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
