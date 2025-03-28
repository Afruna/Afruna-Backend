import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const businessDetailRequestDTO = {
  id: [param('businessDetailId').exists()],
  vendorId: [param('vendorId').exists()],
  create: [
    check('vendorId').optional(),
    check('name').exists().withMessage('Business Name is required'),
    check('country').exists().withMessage('Business Country is required'),
    check('bvn').exists().withMessage('Business BVN is required'),
    check('taxId').exists().withMessage('Tax Registration Id is required'),
    check('registrationId').exists().withMessage('Business Registration Id is required'),
    check('certImage').exists().withMessage('Business Registration Certificate is required')
  ],
  update: [check('vendorId').optional(), check('name').optional(), check('country').optional(), check('bvn').optional(),
  check('taxId').optional(), check('registrationId').optional(), check('certImage').optional()
  ]
};
