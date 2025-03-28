import { Types } from 'mongoose';
import { VendorStatus } from "./Vendor.Interface";

export interface MeansIdentificationInterface {
    _id?: string | Types.ObjectId;
    vendorId?: string | Types.ObjectId;
    docType: DocumentType;
    identificationNumber: string;
    docImage: string;
    status: VendorStatus;
}

export enum DocType {
    PASSPORT = "PASSPORT",
    NIN = "NIN",
    VOTERS_CARD = "VOTERS_CARD"
}