import { body } from 'express-validator';

export const messageValidationRules = {
  sendMessage: [
    body('content').notEmpty().withMessage('Message content is required'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array'),
    body('attachments.*.type').optional().isString().withMessage('Attachment type must be a string'),
    body('attachments.*.url').optional().isURL().withMessage('Attachment URL must be valid'),
    body('attachments.*.name').optional().isString().withMessage('Attachment name must be a string')
  ]
};