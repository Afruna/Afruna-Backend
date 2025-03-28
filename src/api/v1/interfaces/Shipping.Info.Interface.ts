import { VendorStatus } from "./Vendor.Interface";
import { Types } from 'mongoose';

export interface ShippingInfoInterface {
    _id?: string | Types.ObjectId;
    vendorId?: string | Types.ObjectId;
    shippingAddress: ShippingAddressInterface;
    returnAddress: ReturnAddressInterface;
    status: VendorStatus;
}

export interface ReturnAddressInterface {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface ShippingAddressInterface {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}