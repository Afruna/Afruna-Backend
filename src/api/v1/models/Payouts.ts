import { model, Schema } from 'mongoose';
import { PayoutMethod, PayoutStatus, PayoutType, PayoutInterface } from '@interfaces/Payout.Interface';
import { customIdPlugin } from './IdPlugin';

const payoutSchema = new Schema<PayoutInterface>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.PENDING,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(PayoutType),
      required: true
    },
    method: {
      type: String,
      enum: Object.values(PayoutMethod),
      required: true
    },
    bankDetails: {
      accountNumber: String,
      accountName: String,
      bankName: String
    },
    reference: { type: String, required: true, unique: true },
    description: String,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    completedAt: Date,
    failureReason: String,
    customId: String
  },
  {
    timestamps: true
  }
);

// Add indexes for better query performance
payoutSchema.index({ vendorId: 1, status: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ reference: 1 }, { unique: true });

// Add custom ID plugin
payoutSchema.plugin(customIdPlugin, { modelName: 'Payout' });

// Pre-save middleware to generate reference if not provided
payoutSchema.pre('save', function(next) {
  if (!this.reference) {
    this.reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

export default model('Payout', payoutSchema);
