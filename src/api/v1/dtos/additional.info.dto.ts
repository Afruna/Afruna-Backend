import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const additionalInfoRequestDTO = {
  id: [param('additionalInfoId').exists()],
  vendorId: [param('vendorId').exists()],
  create: [
    check('vendorId').optional(),
    check('sellerType').exists().withMessage('Seller Type is required'),
    check('categoryOfProduct').exists().withMessage('Category of Product is required'),
    check('productSource').exists().withMessage('Product Source is required'),
    check('isOfflineSeller').exists().withMessage('Is Offline Seller is required'),
    check('useOtherChannels').exists().withMessage('Use other Channels is required')
  ],
  update: [check('vendorId').optional(), check('shippingAddress').optional(), check('returnAddress').optional()]
};
