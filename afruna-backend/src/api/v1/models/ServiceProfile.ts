import { ServiceProfileInterface } from '@interfaces/Service.Profile.Interface';
import { VendorStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

const ServiceProfileSchema = new Schema<ServiceProfileInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    about: String,
    skills: [String],
    portfolio: [String],
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.SUBMITTED },
},
{ timestamps: true }
);

const ServiceProfile = model('ServiceProfile', ServiceProfileSchema);

export default ServiceProfile;
