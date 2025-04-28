import { Types } from 'mongoose';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { MessageInterface } from '../interfaces/Messages.Interface';
import Service from './service';
import Repository from '../repositories/repository';
import { ConversationInterface } from '../interfaces/Conversation.Interface';

export class ConversationService extends Service<ConversationInterface, Repository<ConversationInterface>> {
  protected repository = new Repository<ConversationInterface>(Conversation);

  // Create a new conversation between participants
  async createConversation(participants: Array<{ id: string; name: string; userType: string }>) {
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: {
        $all: participants.map(participant => ({
          id: participant.id,
          userType: participant.userType
        }))
      }
    });
    if (existingConversation) {
      return existingConversation;
    }
    // Create a new conversation
    const conversation = new Conversation({
      participants,
      unreadCount: {}
    });
    return await conversation.save();
  }

  // Get all conversations for a user
  async getUserConversations(userId: string) {
    return await Conversation.find({
      'participants.id': userId
    })
    .sort({ updatedAt: -1 })
    .lean();
  }

  // Get a single conversation by ID
  async getConversation(conversationId: string) {
    return await Conversation.findById(conversationId).lean();
  }

  // Get messages for a conversation
  async getConversationMessages(conversationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  // Send a new message
  async sendMessage(messageData: Omit<MessageInterface, '_id' | 'createdAt' | 'updatedAt'>) {
    const message = new Message(messageData);
    const savedMessage = await message.save();

    // Update conversation's last message and unread count
    await Conversation.findByIdAndUpdate(messageData.conversationId, {
      lastMessage: {
        content: messageData.content,
        timestamp: new Date()
      },
      $inc: {
        [`unreadCount.${messageData.from.id}`]: 0,
        [`unreadCount.${messageData.from.id}`]: 1
      }
    });

    return savedMessage;
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string) {
    await Message.updateMany(
      {
        conversationId,
        'readBy.userId': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date()
          }
        }
      }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        [`unreadCount.${userId}`]: 0
      }
    });
  }
} 