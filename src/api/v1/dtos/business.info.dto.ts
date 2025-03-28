import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const businessInfoRequestDTO = {
  id: [param('businessInfoId').exists()],
  vendorId: [param('vendorId').exists()],
  create: [
    check('vendorId').optional(),
    check('name').exists().withMessage('Business Name is required'),
    check('phoneNumber').exists().withMessage('Business Phone Number is required'),
    check('emailAddress').exists().withMessage('Email Address is required')
  ],
  update: [check('vendorId').optional(), check('name').optional(), check('phoneNumber').optional(), check('emailAddress').optional()]
};
