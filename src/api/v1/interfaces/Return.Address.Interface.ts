import { Types } from 'mongoose';
import { KYCStatus } from './Vendor.Interface';

export enum DocumentType {
    UTILITY = 'utility',
    LEASE = 'lease',
    OWNERSHIP = 'ownership'
}

export interface ReturnAddressInterface {
    vendorId: Types.ObjectId;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    image: string;
    docType: DocumentType;
    status: KYCStatus;
    rejectionMessage?: string;
}

