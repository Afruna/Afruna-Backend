import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const paymentInfoRequestDto = {
  id: [param('addressId').exists()],
  userId: [param('vendorId').exists()],
  create: [
    check('bankName').exists().withMessage('Bank Name is required'),
    check('accountNumber').exists().withMessage('Account Number is required'),
    check('accountName').exists().withMessage('Account Name is required'),
    check('image').exists().withMessage('Bank Statement is required')
  ],
  update: [check('bankName').optional(), check('accountNumber').optional(), check('accountName').optional(), check('image').optional()]
};
