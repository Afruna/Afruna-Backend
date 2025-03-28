/* eslint-disable func-names */
import { AuthVendorSessionInterface } from '@interfaces/AuthVendorSession.Interface';
import { model, Schema, Model } from 'mongoose';

const sessionSchema = new Schema<AuthVendorSessionInterface>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    token: { type: String, required: [true, 'The token is required'] },
    isLoggedIn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
// sessionSchema.methods.

export default <Model<AuthVendorSessionInterface>>model('vendorsession', sessionSchema);
