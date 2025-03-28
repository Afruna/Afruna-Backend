import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const returnAddressRequestDto = {
  id: [param('addressId').exists()],
  userId: [param('vendorId').exists()],
  create: [
    check('addressLine1').exists().withMessage('street is required'),
    check('addressLine2').optional(),
    check('city').exists().withMessage('city is required'),
    check('postalCode').exists().withMessage('Postal Code is required'),
    check('state').exists().withMessage('state is required'),
    check('country').exists().withMessage('country is required'),
  ],
  update: [check('addressLine1').optional(), check('addressLine2').optional(), check('city').optional(), check('postalCode').optional(),
   check('state').optional(), check('country').optional()]
};
