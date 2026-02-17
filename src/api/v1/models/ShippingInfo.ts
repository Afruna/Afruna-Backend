import { ReturnAddressInterface, ShippingAddressInterface, ShippingInfoInterface } from '@interfaces/Shipping.Info.Interface';
import { KYCStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

export enum BusinessType {
    REGISTERED_BUSINESS = "REGISTERED_BUSINESS",
    INDIVIDUAL_BUSINESS = "INDIVIDUAL_BUSINESS"
}

const ShippingAddressSchema = new Schema<ShippingAddressInterface>({
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    proofOfAddress: String
},
{ timestamps: true }
);

const ReturnAddressSchema = new Schema<ReturnAddressInterface>({
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    proofOfAddress: String
},
{ timestamps: true }
);

const ShippingInfoSchema = new Schema<ShippingInfoInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    shippingAddress: ShippingAddressSchema,
    returnAddress: ReturnAddressSchema,
    status: { type: String, enum: Object.values(KYCStatus), default: KYCStatus.PENDING },
    rejectionMessage: String
},
{ timestamps: true }
);

const ShippingInfo = model('ShippingInfo', ShippingInfoSchema);

export default ShippingInfo;
