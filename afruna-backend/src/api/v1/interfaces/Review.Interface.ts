import { Types } from 'mongoose';

export interface ReviewInterface {
  rating: number;
  vendorId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  productId?: string | Types.ObjectId;
  serviceId?: string | Types.ObjectId;
  comment: string;

}
