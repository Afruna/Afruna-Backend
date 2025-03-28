import { MESSAGES } from '@config';
import { check, param } from 'express-validator';

export const quoteRequestDTO = {
  id: [param('quoteId').exists()],
  create: [
    check('serviceId').exists().withMessage('serviceId is required'),
    check('bookingId').exists().withMessage('bookingId is required'),
    check('userId').exists().withMessage('userId is required'),
    check('amount').exists().withMessage('amount is required')
  ],
  update: [check('serviceId').optional(), check('amount').optional()]
};
