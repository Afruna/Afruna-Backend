import { MESSAGES } from '@config';
import { body, check, param, query } from 'express-validator';

export const wishlistRequestDTO = {
  id: [param('productId').exists()],
  add: [body('productId').exists()],
};
