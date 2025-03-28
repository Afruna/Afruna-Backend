import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const businessInfoRequestDTO = {
  id: [param('businessInfoId').exists()],
  vendorId: [param('vendorId').exists()],
  create: [
    check('vendorId').optional(),
    check('accountDetail').exists().withMessage('Account Detail is required'),
    check('shopDetail').exists().withMessage('shopDetail is required'),
    check('customerCareDetail').exists().withMessage('customerCareDetail is required')
  ],
  update: [check('vendorId').optional(), check('accountDetail').optional(), check('shopDetail').optional(), check('customerCareDetail').optional()]
};
