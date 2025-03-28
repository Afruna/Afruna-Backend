import { MESSAGES } from '@config';
import { body, check, param, query } from 'express-validator';

export const transactionRequestDTO = {
  init: [body('orderId').exists()],
  service: [body('bookingId').exists()],
};
