import mongoose from "mongoose";

/* eslint-disable no-unused-vars */
export enum UserRole {
  USER = 'user',
  VENDOR = 'vendor',
  ADMIN = 'admin',
  PROVIDER = 'provider',
}

export interface AddressInterface {
  address: string;
  street: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
}

export interface PersonalInfo{
  firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string
}

export interface UserInterface {
  _id?: mongoose.Schema.Types.ObjectId | string;
  [x: string]: any;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  password?: string;
  role?: UserRole;
  verifiedEmail?: boolean;
  verificationToken?: string;
  resetToken?: string;
  avatar?: string;
  isVendor?: boolean;
  addresses?: [AddressInterface];
  online?: boolean;
  socketId?: string;
  fromOauth?: boolean;
  followers?: any; // TODO:
  following?: any;
  isFollowing?: boolean;
  isFollower?: boolean;
  visits?: number;
  blocked?: boolean;
  deActivated?: boolean;
  isProvider?: boolean;
  ratings?: number;
  ratedBy?: number;
  bookings?: number; // bookings made by users
  booked?: number; // booked service count
}

export interface IUserResponseDTO
  extends DocType<
    Pick<
      UserInterface,
      | 'email'
      | 'role'
      | 'avatar'
      | 'firstName'
      | 'lastName'
      | 'country'
      | 'phoneNumber'
      | 'online'
      | 'following'
      | 'followers'
    >
  > {}
