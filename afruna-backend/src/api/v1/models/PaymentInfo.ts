
import { Schema, model } from 'mongoose';
import { PaymentInfoInterface } from '@interfaces/PaymentInfo.Interface';
import { VendorStatus } from '@interfaces/Vendor.Interface';

const PaymentInfoSchema = new Schema<PaymentInfoInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    bankName: String,
    accountNumber: String,
    accountName: String,
    image: String,
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.DRAFT },
},
{ timestamps: true }
);

const PaymentInfo = model('PaymentInfo', PaymentInfoSchema);

export default PaymentInfo;
