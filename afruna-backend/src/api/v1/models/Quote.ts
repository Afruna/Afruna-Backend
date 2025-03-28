import { QuoteInterface } from '@interfaces/Quote.Interface';
import { model, Schema } from 'mongoose';

const QuoteSchema = new Schema<QuoteInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    serviceTitle: { type: String },
    amount: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true },
);

export default model('Quote', QuoteSchema);
