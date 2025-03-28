import { DocType, MeansIdentificationInterface } from '@interfaces/Means.Identification.Interface';
import { VendorStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

const MeansIdentificationSchema = new Schema<MeansIdentificationInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    docType: { type: String, enum: Object.values(DocType), default: DocType.NIN },
    identificationNumber: String,
    docImage: String,
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.DRAFT },    
},
{ timestamps: true }
);

const MeansIdentification = model('MeansIdentification', MeansIdentificationSchema);

export default MeansIdentification;
