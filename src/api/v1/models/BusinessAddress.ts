import { BusinessAddressInterface, DocumentType } from '@interfaces/Business.Address.Interface';
import { KYCStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

const BusinessAddressSchema = new Schema<BusinessAddressInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    image: String,
    docType: { type: String, enum: Object.values(DocumentType), default: DocumentType.UTILITY },
    status: { type: String, enum: Object.values(KYCStatus), default: KYCStatus.PENDING },
    rejectionMessage: String
},
{ timestamps: true }
);

const BusinessAddress = model('BusinessAddress', BusinessAddressSchema);

export default BusinessAddress;
