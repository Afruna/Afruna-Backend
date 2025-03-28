import { ReturnAddressInterface, DocumentType } from '@interfaces/Return.Address.Interface';
import { VendorStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

const ReturnAddressSchema = new Schema<ReturnAddressInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    image: String,
    docType: { type: String, enum: Object.values(DocumentType), default: DocumentType.UTILITY },
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.SUBMITTED },
},
{ timestamps: true }
);

const ReturnAddress = model('ReturnAddress', ReturnAddressSchema);

export default ReturnAddress;
