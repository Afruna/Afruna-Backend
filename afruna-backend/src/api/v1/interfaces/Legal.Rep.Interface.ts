import { BusinessType } from "@models/BusinessInfo";
import { Types } from 'mongoose';
import { VendorStatus } from "./Vendor.Interface";

export interface LegalRepInterface {
    _id?: string | Types.ObjectId;
    vendorId?: string | Types.ObjectId;
    firstname: string;
    lastname: string;
    phoneNumber: string;
    emailAddress: string;
    status: VendorStatus;
}