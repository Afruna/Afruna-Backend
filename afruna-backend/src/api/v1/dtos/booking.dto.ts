import { body, check, param } from 'express-validator';

export const bookingRequestDTO = {
  id: [param('bookingId').exists()],
  providerId: [param('vendorId').exists()],
  create: [
    body('vendorId').exists().withMessage('vendor is required'),
    body('serviceId').exists().withMessage('service is required'),
    body('address').exists().withMessage('address is required'),
    body('description').exists().withMessage('Service Description is required')
  ],
  update: [
    body('serviceId').optional(),
    body('address').optional(),
    body('description').optional()
  ],
};
