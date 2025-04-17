import { Types } from "mongoose";
import { KYCStatus } from "./Vendor.Interface";

export interface PaymentInfoInterface {
  _id?: string | Types.ObjectId;
  vendorId?: string | Types.ObjectId;
  bankName: string;
  accountNumber: string;
  accountName: string;
  image: string;
  status: KYCStatus;
  rejectionMessage?: string;
}