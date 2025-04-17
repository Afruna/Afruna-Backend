import { BusinessType } from "@models/BusinessInfo";
import { Types } from 'mongoose';
import { KYCStatus } from "./Vendor.Interface";

export interface BusinessDetailInterface {
    _id?: string | Types.ObjectId;
    vendorId?: string | Types.ObjectId;
    name: string;
    country: string;
    bvn: string;
    taxId: string;
    registrationId: string;
    certImage: string;
    status: KYCStatus;
    rejectionMessage?: string;
}


