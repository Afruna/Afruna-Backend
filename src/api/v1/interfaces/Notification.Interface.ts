/* eslint-disable no-unused-vars */
import { Types } from 'mongoose';

export enum NotificationStatusEnum {
  PENDING = 'pending',
  READ = 'read'
}

export interface NotificationInterface {
  _id?: string | Types.ObjectId;
  userId?: string | Types.ObjectId;
  vendorId?: string | Types.ObjectId;
  subject: string;
  message: string | Types.ObjectId;
  sent_at: Date;
  is_read: boolean;
  status: NotificationStatusEnum;
}
