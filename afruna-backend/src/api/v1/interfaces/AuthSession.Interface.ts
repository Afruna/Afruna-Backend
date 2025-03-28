import { Types } from 'mongoose';
/* eslint-disable no-unused-vars */
export interface AuthSessionInterface {
  userId: string | Types.ObjectId;
  token: string;
  isLoggedIn: boolean;
  getRefreshToken?(): string;
}
