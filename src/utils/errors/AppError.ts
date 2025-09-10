import { Request, Response, NextFunction } from 'express';
import { ValidationError as IValidationError } from '../../types/index.js';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errors?: IValidationError[];

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        errors?: IValidationError[]
    ) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;

        // Maintain proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(errors: IValidationError[], message: string = 'Validation failed') {
        super(message, 400, true, errors);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists') {
        super(message, 409);
    }
}

// Async handler wrapper
export const asyncHandler = <T>(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Global error handler middleware
export const globalErrorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors: IValidationError[] | undefined;

    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        errors = error.errors;
    }

    // Log error for debugging
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method,
        ip: req.ip,
    });

    res.status(statusCode).json({
        message,
        errors,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        message: `Route ${req.originalUrl} not found`,
    });
}; 