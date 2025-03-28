import { BusinessDetailInterface } from '@interfaces/Business.Detail.Interface';
import { VendorStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

export enum BusinessType {
    REGISTERED_BUSINESS = "REGISTERED_BUSINESS",
    INDIVIDUAL_BUSINESS = "INDIVIDUAL_BUSINESS"
}

const BusinessDetailSchema = new Schema<BusinessDetailInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    name: String,
    country: String,
    bvn: String,
    taxId: String,
    registrationId: String,
    certImage: String,
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.DRAFT },    
},
{ timestamps: true }
);

const BusinessDetail = model('BusinessDetail', BusinessDetailSchema);

export default BusinessDetail;
