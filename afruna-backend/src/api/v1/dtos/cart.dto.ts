import { MESSAGES } from '@config';
import { check, param } from 'express-validator';

export const cartRequestDTO = {
  id: [param('productId').exists()],
  productId: [check('productId').exists().withMessage('productId is required')],
};
