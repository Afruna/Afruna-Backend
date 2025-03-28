import { Types } from 'mongoose';
import { ChatInterface, USER_TYPE } from './Chat.Interface';

export interface MessageInterface {
  _id?: string | Types.ObjectId;
  chats?: [ChatInterface];
  from?: { id: string | Types.ObjectId, name: string, userType: USER_TYPE};
  to?: { id: string | Types.ObjectId , name: string, userType: USER_TYPE};
  fromId: string;
  toId: string;
}
