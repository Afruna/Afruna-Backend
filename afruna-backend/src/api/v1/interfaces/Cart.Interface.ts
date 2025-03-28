import { Types } from 'mongoose';

export interface CartInterface {
  productId: string | Types.ObjectId;
  quantity: number;
  total: number;
  sessionId: string | Types.ObjectId;
  vendorId: string | Types.ObjectId;
  vendor: string | Types.ObjectId;
  customId?: string;
  options: any[];
}

export interface CartSessionInterface {
  userId: string | Types.ObjectId;
  sessionId: string;
  numberOfItems: number;
  total: number;
  customId?: string;
}
