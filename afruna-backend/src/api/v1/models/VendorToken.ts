import { TokenTypeEnum } from '@interfaces/Token.Interface';
import { VendorTokenInterface } from '@interfaces/VendorToken.Interface';
import { Schema, model } from 'mongoose';

const TokenSchema = new Schema<VendorTokenInterface>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    code: String,
    type: { type: String, enum: Object.values(TokenTypeEnum) },
    expiresAt: Date,
  },
  { timestamps: true },
);

const VendorToken = model('VendorToken', TokenSchema);

export default VendorToken;
