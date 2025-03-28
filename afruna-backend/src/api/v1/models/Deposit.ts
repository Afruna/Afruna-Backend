import { Schema, model } from 'mongoose';
import { DEPOSIT_STATUS, DepositInterface } from '@interfaces/Deposit.Interface';

const DepositSchema = new Schema<DepositInterface>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: Number,
    transactionReference: String,
    status: { type: String, enum: Object.values(DEPOSIT_STATUS), default: DEPOSIT_STATUS.PENDING },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the current date and time
      },
  },
  { timestamps: true },
);

const Deposit = model('Deposit', DepositSchema);

export default Deposit;
