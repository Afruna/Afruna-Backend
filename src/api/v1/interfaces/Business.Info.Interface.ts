import { BusinessType } from "@models/BusinessInfo";
import { Types } from 'mongoose';
import { VendorStatus } from "./Vendor.Interface";

export interface BusinessInfoInterface {
    _id?: string | Types.ObjectId;
    vendorId?: string | Types.ObjectId;
    name: string;
    phoneNumber: string;
    emailAddress: string;
    status: VendorStatus;
}


// export interface AccountDetailInterface {
//     email: string;
//     phoneNumber: string;
//     countryRegistration: string;
//     accountType: BusinessType;
// }

// export interface ShopDetailInterface {
//     shopName: string;
//     contactName: string;
//     contactEmail: string;
//     contactPhoneNumber: string;
// }

// export interface CustomerCareDetailInterface {
//     customerCareName: string;
//     customerCarePhoneNumber: string;
//     customerCareEmail: string;
//     addressLine1: string;
//     addressLine2: string;
//     city: string;
//     state: string;
//     country: string;
//     postalCode: string;
// }