import { KYCStatus } from "./Vendor.Interface";
import { Types } from 'mongoose';


export interface StoreFrontInterface {
    _id?: string | Types.ObjectId;
    vendorId?: string | Types.ObjectId;
    name: string;
    link: string;
    logo: string;
    favIcon: string;
    status: KYCStatus;
    rejectionMessage?: string;
}