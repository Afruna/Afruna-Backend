import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const addressRequestDTO = {
  id: [param('addressId').exists()],
  userId: [param('userId').exists()],
  create: [
    check('name').optional(),
    check('phoneNumber').optional(),
    check('address').optional(),
    check('streetNumber').exists().withMessage('street is required'),
    check('postCode').optional(),
    check('city').exists().withMessage('city is required'),
    check('state').exists().withMessage('state is required'),
    check('country').exists().withMessage('country is required'),
  ],
  update: [check('name').optional(), check('phoneNumber').optional(), check('address').optional(), check('streetNumber').optional(), check('postCode').optional(),
   check('state').optional(), check('country').optional()]
};
