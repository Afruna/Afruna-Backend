import { model, Schema } from 'mongoose';
import { MessageInterface } from '@interfaces/Messages.Interface';
import { USER_TYPE } from '@interfaces/Chat.Interface';

const MessageSchema = new Schema<MessageInterface>(
  {
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
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
    fromId: String,
    toId: String
  },
  { timestamps: true },
);

export default model('Message', MessageSchema);
