import { MESSAGES } from '@config';
import { body, check, param, query } from 'express-validator';

export const orderRequestDTO = {
  // id: [param('conversationId').exists()],
  role: [query('role').exists()],
  create: [
    body('addressId').exists(),
    body('paymentMethod').exists()
  ],

  addAddress: [
    body('street').exists(),
    body('localGovernment').exists(),
    body('state').exists(),
    body('country').exists(),
  ],
};
