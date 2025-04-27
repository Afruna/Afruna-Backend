import { Types } from 'mongoose';

export enum BookingStatus {
  COMPLETED = 'COMPLETED',
  ACCEPT = 'ACCEPTED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DECLINE = 'DECLINED',
}

export interface BookingInterface {
  _id?: string | Types.ObjectId;
  vendorId?: string | Types.ObjectId;
  userId?: string | Types.ObjectId;
  serviceId?: string | Types.ObjectId;
  amount?: number;
  address?: string;
  description?: string;
  hasClientConfirmed?: boolean;
  status?: BookingStatus;
}
