import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const cardRequestDTO = {
  id: [param('cardId').exists()],
  userId: [param('userId').exists()],
  create: [
    
  ],
  update: [check('name').optional(), check('phoneNumber').optional(), check('address').optional(), check('streetNumber').optional(), check('postCode').optional(),
   check('state').optional(), check('country').optional()]
};
