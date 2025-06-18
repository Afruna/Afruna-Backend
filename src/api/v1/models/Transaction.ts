import { model, Schema } from 'mongoose';
import { PaymentMethod, TransactionEvent, TransactionInterface } from '@interfaces/Transaction.Interface';
import { customIdPlugin } from './IdPlugin';
import { Query } from 'mongoose';

const transactionSchema = new Schema<TransactionInterface>(
  {
    success: Boolean,
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    source: {
      type: String,
      enum: ['service', 'marketplace'],
      default: 'marketplace',
    },
    amount: Number,
    date: Date,
    description: String,
    paymentMethod: {
      type: String,
      enum: [PaymentMethod.WALLET, PaymentMethod.CARD],
    },
    reference: String,
    event: {
      type: String,
      enum: [
        TransactionEvent.CREDITED,
        TransactionEvent.LISTING_FEE,
        TransactionEvent.PAYMENT,
        TransactionEvent.WITHDRAWAL,
      ],
    },
    customId: String,
  },
  {
    timestamps: true,
  },
);

transactionSchema.pre(/^find/, function (this: Query<any, any>, next) {
  this.sort({ createdAt: -1 });
  next();
});

transactionSchema.plugin(customIdPlugin, { modelName: 'Transaction' });

export default model('Transaction', transactionSchema);
