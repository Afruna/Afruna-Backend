import { Request, Response } from 'express';
import { ConversationService } from '../services/ConversationService';
import { UserInterface } from '../interfaces/User.Interface';
import { body, param, query, validationResult } from 'express-validator';
import Controller from './controller';
import { ConversationInterface } from '../interfaces/Conversation.Interface';

export class ConversationController extends Controller<ConversationInterface> {
  service = new ConversationService();
  responseDTO = undefined;

  constructor() {
    super('conversation');
  }

  // Create a new conversation
  createConversation = this.control(async (req: Request) => {
    const user = req.vendor as any;
    const participants = [
      {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        userType: user.role || 'VENDOR'
      },
      ...req.body.participants
    ];
    return this.service.createConversation(participants);
  });

  // Get all conversations for the current user
  getConversations = this.control(async (req: Request) => {
    let user = '';
    if(req.user){
      user = req.user as UserInterface;
    }
    else{
      user = req.vendor as any;
    }
    const userId = user._id as any;
    return this.service.getUserConversations(userId as string);
  });

  // Get a single conversation by ID
  getConversation = this.control(async (req: Request) => {
    const conversation = await this.service.getConversation(req.params.id);
    if (!conversation) throw new this.HttpError('Conversation not found', 404);
    return conversation;
  });

  // Get messages for a conversation
  getMessages = this.control(async (req: Request) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    return this.service.getConversationMessages(req.params.id, page, limit);
  });

  // Send a new message
  sendMessage = this.control(async (req: Request) => {
    const user = req.user as UserInterface;
    const messageData = {
      ...req.body,
      from: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        userType: user.role || 'user'
      }
    };
    return this.service.sendMessage(messageData);
  });

  // Mark messages as read
  markAsRead = this.control(async (req: Request) => {
    const userId = (req.user as UserInterface)._id;
    return this.service.markMessagesAsRead(req.params.id, userId as string);
  });
} 