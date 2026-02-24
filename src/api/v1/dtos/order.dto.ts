import { MESSAGES } from '@config';
import { body, check, param, query } from 'express-validator';

export const orderRequestDTO = {
  // id: [param('conversationId').exists()],
  role: [query('role').exists()],
  create: [
    body('addressId').exists(),
    body('paymentMethod').exists()
  ],

  guestCheckout: [
    body('guestEmail').isEmail().withMessage('Valid email is required'),
    body('guestName').notEmpty().withMessage('Name is required'),
    body('guestPhone').notEmpty().withMessage('Phone number is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  ],

  addAddress: [
    body('street').exists(),
    body('localGovernment').exists(),
    body('state').exists(),
    body('country').exists(),
  ],
};
