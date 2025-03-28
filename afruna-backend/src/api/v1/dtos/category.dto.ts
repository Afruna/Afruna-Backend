import { MESSAGES } from '@config';
import { body, check, param } from 'express-validator';

export const categoryRequestDTO = {
  id: [param('categoryId').exists()],
  maincategory: [param('maincategory').exists()],
  create: [
    check('name').exists().withMessage('name is required'),
    // check('mainCategory').exists().withMessage('Main Category is required'),
    check('parent').optional(),
    check('icon').optional(),
  ],
  update: [check('name').optional(), check('mainCategory').optional(), check('parent').optional(), check('icon').optional()],
  options: [body('options').isArray()],
  option: [body('option').isString()],
};
