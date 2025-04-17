import { LegalRepInterface } from '@interfaces/Legal.Rep.Interface';
import { KYCStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

const LegalRepSchema = new Schema<LegalRepInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    firstname: String,
    lastname: String,
    phoneNumber: String,
    emailAddress: String,
    status: { type: String, enum: Object.values(KYCStatus), default: KYCStatus.PENDING },
    rejectionMessage: String
},
{ timestamps: true }
);

const LegalRep = model('LegalRep', LegalRepSchema);

export default LegalRep;
