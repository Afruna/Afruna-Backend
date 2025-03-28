import { Types } from 'mongoose';

export interface WishlistInterface {
  userId: string | Types.ObjectId;
  sessionId: string;
  productsId: [string | Types.ObjectId];
}
