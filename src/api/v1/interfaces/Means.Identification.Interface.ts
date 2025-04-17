import { Types } from 'mongoose';
import { KYCStatus } from "./Vendor.Interface";

export enum DocType {
    NIN = 'nin',
    DRIVERS_LICENSE = 'drivers_license',
    VOTERS_CARD = 'voters_card',
    INTERNATIONAL_PASSPORT = 'international_passport'
}

export interface MeansIdentificationInterface {
    vendorId: Types.ObjectId;
    docType: DocType;
    identificationNumber: string;
    docImage: string;
    status: KYCStatus;
    rejectionMessage?: string;
}