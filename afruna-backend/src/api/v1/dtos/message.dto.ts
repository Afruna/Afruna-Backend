import { MESSAGES } from '@config';
import { check, param } from 'express-validator';

export const messageRequestDTO = {
  id: [param('conversationId').exists()],
  create: [
    check('to').exists().withMessage('to is required'),
    check('message').exists().withMessage('message is required'),
  ],
};
