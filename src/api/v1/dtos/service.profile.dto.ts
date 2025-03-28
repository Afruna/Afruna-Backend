import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const serviceProfileRequestDTO = {
  id: [param('serviceProfileId').exists()],
  vendorId: [param('vendorId').exists()],
  create: [
    check('vendorId').optional(),
    check('about').exists().withMessage('About Profile is required'),
    check('portfolio').exists().withMessage('Vendor Portfolio is required'),
    check('skills').exists().withMessage('Vendor Skills is required')
  ],
  update: [check('vendorId').optional(), check('about').optional(), check('portfolio').optional(), check('skills').optional()]
};
