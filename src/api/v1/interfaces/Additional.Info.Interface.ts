import { Types } from 'mongoose';
import { KYCStatus } from './Vendor.Interface';

export interface AdditionalInfoInterface {
    _id?: string | Types.ObjectId;
    vendorId?: string | Types.ObjectId;
    sellerType: string;
    categoryOfProduct: string;
    productSource: string;
    isOfflineSeller: boolean;
    useOtherChannels: boolean;
    status: KYCStatus;
    rejectionMessage?: string;
}

export enum SELLER_TYPE {
    RETAIL = "RETAIL",
    WHOLESALE = "WHOLESALE"
}