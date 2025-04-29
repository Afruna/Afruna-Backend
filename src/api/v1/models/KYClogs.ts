import { Schema, model } from 'mongoose';
import { KYClogsInterface, KYCStatus, KYCType } from '@interfaces/KYClogs.Interface';

const KYClogsSchema = new Schema<KYClogsInterface>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    status: { type: String, enum: Object.values(KYCStatus), default: KYCStatus.PENDING },
    businessDetailStatus: {type: Boolean, default: false},
    businessInfoStatus: {type: Boolean, default: false},
    shippingInfoStatus: {type: Boolean, default: false},
    legalRepStatus: {type: Boolean, default: false},
    paymentInfoStatus: {type: Boolean, default: false},
    meansIdentificationStatus: {type: Boolean, default: false},
    customerCareStatus: {type: Boolean, default: false},
    additionalInfoStatus: {type: Boolean, default: false},
    storeFrontStatus: {type: Boolean, default: false},
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date
  },
  { timestamps: true }
);

const KYClogs = model('KYClogs', KYClogsSchema);

export default KYClogs;
