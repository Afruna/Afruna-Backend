import { body, check, param } from 'express-validator';

export const notificationRequestDTO = {
  id: [param('notificationId').exists()],
  notificationId: [param('notificationId').exists()],
  create: [
    body('subject').exists().withMessage('subject is required'),
    body('message').exists().withMessage('subject is required'),
  ],
  update: [
    param('notificationId').exists().withMessage('notificationId is required'),
    body('is_read').exists().withMessage('is_read is required')
  ],
};
