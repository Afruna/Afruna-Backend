import mongoose, { model, Schema } from 'mongoose';
import { ChatInterface, MESSAGE_TYPE, USER_TYPE } from '@interfaces/Chat.Interface';

const ChatSchema = new Schema<ChatInterface>(
  {
    to: {
      id: String,
      name: String,
      userType: { type: String, enum: Object.values(USER_TYPE), default: USER_TYPE.USER },
    },
    from: {
      id: String,
      name: String,
      userType: { type: String, enum: Object.values(USER_TYPE), default: USER_TYPE.USER },
    },
    message: {
      type: String,
      required: false,
    },
    link: [String],
    messageType: { type: String, enum: Object.values(MESSAGE_TYPE), default: MESSAGE_TYPE.NORMAL },
    quote: {
        type: Schema.Types.ObjectId,
        ref: 'Quote',
      },
    quoteData: mongoose.Schema.Types.Mixed
  },
  { timestamps: true },
);

export default model('Chat', ChatSchema);
