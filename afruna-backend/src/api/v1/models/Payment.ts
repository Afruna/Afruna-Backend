import { PAYMENT_METHOD, PAYMENT_STATUS, PaymentInterface } from '@interfaces/Payment.Interface';
import { Schema, model } from 'mongoose';

const PaymentSchema = new Schema<PaymentInterface>(
  {
    referenceId: String,
    amount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHOD), default: PAYMENT_METHOD.PAYSTACK },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING},
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true },
);

const Address = model('Payment', PaymentSchema);

export default Address;
