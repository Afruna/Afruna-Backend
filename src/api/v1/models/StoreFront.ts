import { StoreFrontInterface } from '@interfaces/Store.Front.Interface';
import { VendorStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

export enum BusinessType {
    REGISTERED_BUSINESS = "REGISTERED_BUSINESS",
    INDIVIDUAL_BUSINESS = "INDIVIDUAL_BUSINESS"
}

const StoreFrontSchema = new Schema<StoreFrontInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    name: String,
    link: String,
    logo: String,
    favIcon: String,
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.DRAFT },
},
{ timestamps: true }
);



const StoreFront = model('StoreFront', StoreFrontSchema);

export default StoreFront;
