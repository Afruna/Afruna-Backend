import { Types } from "mongoose";
import { VendorStatus } from "./Vendor.Interface";

export interface ServiceProfileInterface {
  _id?: string | Types.ObjectId;
  vendorId?: string | Types.ObjectId;
  about: string;
  skills: string[];
  portfolio: string[];
  status: VendorStatus;
}