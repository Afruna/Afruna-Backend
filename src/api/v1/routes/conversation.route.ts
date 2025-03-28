/* eslint-disable import/no-unresolved */
import { Router } from 'express';
import { ConversationController } from '../controllers/ConversationController';
import { messageValidationRules } from '../dtos/message.dto';
import Route from './route';
import { ConversationInterface } from '../interfaces/Conversation.Interface';
import { authorize, authorizeVendor, authenticateUserOrVendor } from '@middlewares/jwt';
import { body } from 'express-validator';
// import { CreateMessageDto } from '../dtos/message.dto';
// import { ValidationMiddleware } from '../middlewares/validation.middleware';
// import { AuthMiddleware } from '../middlewares/auth.middleware';

export default class ConversationRoute extends Route<ConversationInterface> {
  controller = new ConversationController();
  dto = messageValidationRules;

  initRoutes(): Router {
    // Apply auth middleware to all routes
    this.router.use(authenticateUserOrVendor());

    // Create a new conversation
    this.router.post('/', 
      body('participants').isArray().withMessage('Participants must be an array'),
      body('participants.*.id').isString().withMessage('Participant ID is required'),
      body('participants.*.name').isString().withMessage('Participant name is required'),
      body('participants.*.userType').isString().withMessage('Participant user type is required'),
      this.controller.createConversation
    );

    // Get all conversations for the current user
    this.router.get('/', this.controller.getConversations);

    // Get a single conversation
    this.router.get('/:id', this.controller.getConversation);

    // Get messages for a conversation
    this.router.get('/:id/messages', this.controller.getMessages);

    // Send a new message
    this.router.post('/:id/messages', this.controller.sendMessage);

    // Mark messages as read
    this.router.post('/:id/read', this.controller.markAsRead);

    return this.router;
  }
}
