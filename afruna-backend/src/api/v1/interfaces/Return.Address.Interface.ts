import { Types } from 'mongoose';
import { VendorStatus } from './Vendor.Interface';

export interface ReturnAddressInterface {
    _id?: string | Types.ObjectId;
    vendorId?: string | Types.ObjectId;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    image: string;
    docType: DocumentType;
    status: VendorStatus;
}


export enum DocumentType {
    UTILITY = "UTILITY",
    BANK_STATEMENT = "BANK_STATEMENT"
}

