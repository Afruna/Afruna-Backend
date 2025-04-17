import { Schema, model } from 'mongoose';
import { PaymentInfoInterface } from '@interfaces/PaymentInfo.Interface';
import { KYCStatus } from '@interfaces/Vendor.Interface';

const PaymentInfoSchema = new Schema<PaymentInfoInterface>({
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    bankName: String,
    accountNumber: String,
    accountName: String,
    image: String,
    status: { type: String, enum: Object.values(KYCStatus), default: KYCStatus.PENDING },
    rejectionMessage: String
},
{ timestamps: true }
);

const PaymentInfo = model('PaymentInfo', PaymentInfoSchema);

export default PaymentInfo;
