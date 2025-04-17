import { BusinessInfoInterface } from '@interfaces/Business.Info.Interface';
import { KYCStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

export enum BusinessType {
    REGISTERED_BUSINESS = "REGISTERED_BUSINESS",
    INDIVIDUAL_BUSINESS = "INDIVIDUAL_BUSINESS"
}

const BusinessInfoSchema = new Schema<BusinessInfoInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    name: String,
    phoneNumber: String,
    emailAddress: String,
    status: { type: String, enum: Object.values(KYCStatus), default: KYCStatus.PENDING },
    rejectionMessage: String
},
{ timestamps: true }
);

const BusinessInfo = model('BusinessInfo', BusinessInfoSchema);

export default BusinessInfo;
