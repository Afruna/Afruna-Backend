import { DocType, MeansIdentificationInterface } from '@interfaces/Means.Identification.Interface';
import { KYCStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

const MeansIdentificationSchema = new Schema<MeansIdentificationInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    docType: { type: String, enum: Object.values(DocType), default: DocType.NIN },
    identificationNumber: String,
    docImage: String,
    status: { type: String, enum: Object.values(KYCStatus), default: KYCStatus.PENDING },
    rejectionMessage: String
},
{ timestamps: true }
);

const MeansIdentification = model('MeansIdentification', MeansIdentificationSchema);

export default MeansIdentification;
