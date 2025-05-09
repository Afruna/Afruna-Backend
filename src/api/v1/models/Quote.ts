import { QuoteInterface } from '@interfaces/Quote.Interface';
import { model, Schema } from 'mongoose';

export type quoteStatus = 'pending' | 'paid' | 'completed' | 'canceled';

const QuoteSchema = new Schema<QuoteInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Provide' },
    serviceTitle: { type: String },
    
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'completed', 'canceled'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

export default model('Quote', QuoteSchema);
