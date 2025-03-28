import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const shippingInfoRequestDTO = {
  id: [param('shippingInfoId').exists()],
  vendorId: [param('vendorId').exists()],
  create: [
    check('vendorId').optional(),
    check('shippingAddress').exists().withMessage('Shipping Address is required'),
    check('returnAddress').exists().withMessage('Return Address is required')
  ],
  update: [check('vendorId').optional(), check('shippingAddress').optional(), check('returnAddress').optional()]
};
