import { body, check, param } from 'express-validator';

export const legalRepRequestDTO = {
  id: [param('legalRepId').exists()],
  vendorId: [param('vendorId').exists()],
  create: [
    check('vendorId').optional(),
    check('firstname').exists().withMessage('First Name is required'),
    check('lastname').exists().withMessage('Last Name is required'),
    check('phoneNumber').exists().withMessage('Phone Number is required'),
    check('emailAddress').exists().withMessage('Email Address is required')
  ],
  update: [check('vendorId').optional(), check('firstname').optional(), check('lastname').optional(), check('phoneNumber').optional(), check('emailAddress').optional()]
};
