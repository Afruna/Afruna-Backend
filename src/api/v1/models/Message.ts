import { model, Schema } from 'mongoose';
import { MessageInterface } from '@interfaces/Messages.Interface';
import { USER_TYPE } from '@interfaces/Chat.Interface';

const MessageSchema = new Schema<MessageInterface>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    content: { type: String, required: true },
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    readBy: [{
      userId: String,
      readAt: { type: Date, default: Date.now }
    }],
    attachment: String,
    quote: {type:  Schema.Types.ObjectId, ref: 'Quote', required: false  },
    quoteData: {type: Object, required: false},
  },
  { timestamps: true },
);

// Indexes for faster queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ 'from.id': 1 });

export default model('Message', MessageSchema);