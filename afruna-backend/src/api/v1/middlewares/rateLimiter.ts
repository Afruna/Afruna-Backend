import rateLimit from 'express-rate-limit';

// eslint-disable-next-line import/prefer-default-export
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skipSuccessfulRequests: true,
});
