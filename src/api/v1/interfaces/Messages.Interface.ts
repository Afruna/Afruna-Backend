import { Types } from 'mongoose';
import { USER_TYPE } from './Chat.Interface';

export interface MessageInterface {
  _id?: string | Types.ObjectId;
  quoteData?: any;
  conversationId: Types.ObjectId;
  content: string;
  from: Types.ObjectId;
  quote?: Types.ObjectId
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}
