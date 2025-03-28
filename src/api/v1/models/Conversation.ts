import { model, Schema } from 'mongoose';
import { USER_TYPE } from '@interfaces/Chat.Interface';

interface ConversationInterface {
  participants: {
    id: string;
    name: string;
    userType: USER_TYPE;
  }[];
  lastMessage?: {
    content: string;
    timestamp: Date;
  };
  unreadCount?: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<ConversationInterface>(
  {
    participants: [{
      id: String,
      name: String,
      userType: { type: String, enum: Object.values(USER_TYPE), default: USER_TYPE.USER }
    }],
    lastMessage: {
      content: String,
      timestamp: Date
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { timestamps: true }
);

// Index for faster queries
ConversationSchema.index({ 'participants.id': 1 });
ConversationSchema.index({ updatedAt: -1 });

export default model('Conversation', ConversationSchema);