import { Request, Response, NextFunction } from 'express';
import CartSessionRepository from '@repositories/CartSession.repo';
import CartRepository from '@repositories/Cart.repo';
import { CartSessionInterface } from '@interfaces/Cart.Interface';
import { logger } from '@utils/logger';

// Middleware for managing cart sessions
export const cartSessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Prefer sessionId from request headers if present, else use req.sessionID
  const headerSessionId = req.headers['sessionId'] as string | undefined;
  if (headerSessionId) {
    req.session.cartId = headerSessionId;
  } else if (!req.session.cartId) {
    req.session.cartId = req.sessionID;
  };
  next();
};

// Middleware for managing page visits
// const pageVisitMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.session.pageVisits) {
//     req.session.pageVisits = [];
//   }
//   req.session.pageVisits.push({ path: req.path, timestamp: new Date() });
//   next();
// };