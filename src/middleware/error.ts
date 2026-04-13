import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  
  if (err instanceof AppError) {
    logger.warn({
      message: err.message,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      requestId,
      path: req.path,
      method: req.method,
    });
    
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      error: err.errorCode,
      message: err.message,
      details: err.details,
      requestId,
    });
  }

  logger.error({
    message: err.message,
    stack: err.stack,
    requestId,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    statusCode: 500,
    error: 'INTERNAL_ERROR',
    message: 'Internal server error',
    requestId,
  });
};

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] as string || uuidv4();
  res.setHeader('x-request-id', req.headers['x-request-id']);
  next();
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    requestId: req.headers['x-request-id'],
  });
};
