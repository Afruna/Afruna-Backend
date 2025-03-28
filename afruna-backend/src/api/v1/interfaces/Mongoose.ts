import { Document } from 'mongoose';
import { UserRole } from './User.Interface';

export interface UserInterface extends Document {
  _id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  email: string;
  password: string;
  role: UserRole;
  verifiedEmail?: boolean;
  verificationToken?: string;
  avatar?: string;
  resetToken?: string;
  isVendor?: boolean;
  isProvider?: boolean;
  addresses?: {
    address?: string;
    street?: string;
    postCode?: string;
    city?: string;
    state?: string;
    country?: string;
  }[];
  online?: boolean;
  socketId?: string;
  fromOauth?: boolean;
  blocked?: boolean;
  followers?: any[];
  following?: any[];
  isFollowing?: any;
  isFollower?: any;
  visits?: number;
  ratings?: number;
  ratedBy?: number;
  bookings?: number;
  booked?: number;
}
