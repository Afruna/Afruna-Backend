import { LegalRepInterface } from '@interfaces/Legal.Rep.Interface';
import { VendorStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

const LegalRepSchema = new Schema<LegalRepInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    firstname: String,
    lastname: String,
    phoneNumber: String,
    emailAddress: String,
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.SUBMITTED },    
},
{ timestamps: true }
);

const LegalRep = model('LegalRep', LegalRepSchema);

export default LegalRep;
