import { AdditionalInfoInterface, SELLER_TYPE } from '@interfaces/Additional.Info.Interface';
import { VendorStatus } from '@interfaces/Vendor.Interface';
import { Schema, model } from 'mongoose';

const AdditionalInfoSchema = new Schema<AdditionalInfoInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    sellerType: String,
    categoryOfProduct: String,
    productSource: String,
    isOfflineSeller: Boolean,
    useOtherChannels: Boolean,
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.SUBMITTED },
    rejectionMessage: String
},
{ timestamps: true }
);

const AdditionalInfo = model('AdditionalInfo', AdditionalInfoSchema);

export default AdditionalInfo;
