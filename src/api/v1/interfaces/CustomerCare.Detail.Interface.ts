import { Types } from 'mongoose';
import { VendorStatus } from "./Vendor.Interface";

export interface CustomerCareDetailInterface {
    _id?: string | Types.ObjectId;
    vendorId?: string | Types.ObjectId;
    name: string;
    emailAddress: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    status: VendorStatus;
}


