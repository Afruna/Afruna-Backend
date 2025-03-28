import { Types } from 'mongoose';
/* eslint-disable no-unused-vars */
export interface AuthVendorSessionInterface {
  vendorId: string | Types.ObjectId;
  token: string;
  isLoggedIn: boolean;
  getRefreshToken?(): string;
}
