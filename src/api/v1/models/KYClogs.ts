import { Schema, model } from 'mongoose';
import { KYClogsInterface, KYCStatus, KYCType } from '@interfaces/KYClogs.Interface';

const KYClogsSchema = new Schema<KYClogsInterface>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    kycType: { type: String, enum: Object.values(KYCType), required: true },
    status: { type: String, enum: Object.values(KYCStatus), default: KYCStatus.PENDING },
    message: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date
  },
  { timestamps: true }
);

const KYClogs = model('KYClogs', KYClogsSchema);

export default KYClogs;
