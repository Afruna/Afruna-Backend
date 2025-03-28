import { model, Schema } from 'mongoose';
import { ConversationInterface } from '@interfaces/Conversation.Interface';

const ConversationSchema = new Schema<ConversationInterface>(
  {
    
    // recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // lastMessage: {
    //   type: String,
    // },
    // alias: {
    //   type: String,
    // },
    // aliasAvatar: {
    //   type: String,
    // },
    // unreadMessages: {
    //   type: Number,
    //   default: 0,
    // },
  },
  { timestamps: true },
);

export default model('Conversation', ConversationSchema);
