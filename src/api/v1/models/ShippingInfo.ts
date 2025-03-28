import { ReturnAddressInterface, ShippingAddressInterface, ShippingInfoInterface } from '@interfaces/Shipping.Info.Interface';
import { VendorStatus } from '@interfaces/Vendor.Interface';
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
    postalCode: String
},
{ timestamps: true }
);

const ReturnAddressSchema = new Schema<ReturnAddressInterface>({
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
},
{ timestamps: true }
);


const ShippingInfoSchema = new Schema<ShippingInfoInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    shippingAddress: ShippingAddressSchema,
    returnAddress: ReturnAddressSchema,
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.DRAFT },
},
{ timestamps: true }
);

const ShippingInfo = model('ShippingInfo', ShippingInfoSchema);

export default ShippingInfo;
