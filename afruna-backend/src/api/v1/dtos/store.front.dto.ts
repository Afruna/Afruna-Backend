import { body, check, param } from 'express-validator';

export const storeFrontRequestDTO = {
  id: [param('storeFrontId').exists()],
  vendorId: [param('vendorId').exists()],
  create: [
    check('vendorId').optional(),
    check('name').exists().withMessage('Store Name is required'),
    check('link').exists().withMessage('Store Link is required'),
    check('logo').exists().withMessage('Logo is required'),
    check('favIcon').exists().withMessage('favIcon is required')
  ],
  update: [check('vendorId').optional(), check('shippingAddress').optional(), check('returnAddress').optional()]
};
