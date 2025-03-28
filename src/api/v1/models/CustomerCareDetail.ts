import { CustomerCareDetailInterface } from '@interfaces/CustomerCare.Detail.Interface';
import { Schema, model } from 'mongoose';

export enum BusinessType {
    REGISTERED_BUSINESS = "REGISTERED_BUSINESS",
    INDIVIDUAL_BUSINESS = "INDIVIDUAL_BUSINESS"
}

const CustomerCareDetailSchema = new Schema<CustomerCareDetailInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    name: String,
    phoneNumber: String,
    emailAddress: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
},
{ timestamps: true }
);

const CustomerCareDetail = model('CustomerCareDetail', CustomerCareDetailSchema);

export default CustomerCareDetail;
