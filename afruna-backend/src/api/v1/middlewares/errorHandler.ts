/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import HttpError from '@helpers/HttpError';

// eslint-disable-next-line import/prefer-default-export
export const errorHandler = (
  err: HttpError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error: any;

  if (typeof err === 'object') error = { ...err };
  else if (typeof err === 'string') error.message = err;
  error.message = err.message;

  let statusCode: number;
  if ('statusCode' in error) {
    statusCode = error.statusCode;
  } else {
    statusCode = 500;
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    error,
  });
};
