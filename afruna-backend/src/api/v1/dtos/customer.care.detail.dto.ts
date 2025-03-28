import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const customerCareDetailRequestDTO = {
  id: [param('customerCareDetailId').exists()],
  vendorId: [param('vendorId').exists()],
  create: [
    check('vendorId').optional(),
    check('name').exists().withMessage('Customer Care Name is required'),
    check('phoneNumber').exists().withMessage('Customer Care Phone Number is required'),
    check('emailAddress').exists().withMessage('Customer Care Email is required'),
    check('addressLine1').exists().withMessage('Address Line 1 is required'),
    check('addressLine2').exists().withMessage('Address Line 2 is required'),
    check('city').exists().withMessage('Business City is required'),
    check('state').exists().withMessage('Business State is required'),
    check('country').exists().withMessage('Business Country is required'),
    check('postalCode').exists().withMessage('Business Postal Code is required')
  ],
  update: [check('vendorId').optional(), check('accountDetail').optional(), check('shopDetail').optional(), check('customerCareDetail').optional()]
};
