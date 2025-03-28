import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const mainCategoryRequestDTO = {
  id: [param('maincategoryId').exists()],
  create: [
    check('name').exists().withMessage('name is required'),
    check('image').exists().withMessage('image is required'),
  ],
  update: [check('name').optional(), check('image').optional()],
  options: [body('options').isArray()],
  option: [body('option').isString()],
};
