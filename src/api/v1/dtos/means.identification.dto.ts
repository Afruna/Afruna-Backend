import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const meansIdentificationRequestDTO = {
  id: [param('meansIdentificationId').exists()],
  vendorId: [param('vendorId').exists()],
  create: [
    check('vendorId').optional(),
    // check('docType').exists().withMessage('Document Type is required'),
    check('identificationNumber').exists().withMessage('Identification Number is required'),
    check('docImage').exists().withMessage('Document Image is required')
  ],
  update: [check('vendorId').optional(), check('identificationNumber').optional(), check('docImage').optional()]
};
