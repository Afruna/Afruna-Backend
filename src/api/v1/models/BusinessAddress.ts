import { BusinessAddressInterface, DocumentType } from '@interfaces/Business.Address.Interface';
import { VendorStatus } from '@interfaces/Vendor.Interface';
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
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.DRAFT },
},
{ timestamps: true }
);

const BusinessAddress = model('BusinessAddress', BusinessAddressSchema);

export default BusinessAddress;
