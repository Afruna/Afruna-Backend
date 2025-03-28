import { MESSAGES } from '@config';
import { body, check, param, query } from 'express-validator';

export const reviewRequestDTO = {
  productId: [param('productId').exists()],
  serviceId: [param('serviceId').exists()],
  rate: [
    body('productId').custom((val, { req }) => {
      if (req.body.productId || req.body.serviceId) {
        return true;
      }
      return false;
    }),
    body('rating').optional(),
    body('comment').optional(),
  ],

  rateService: [
    body('serviceId').exists(),
    body('comment').exists(),
    body('rating').exists(),
  ],};
