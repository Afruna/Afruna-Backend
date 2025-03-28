import { TokenInterface, TokenTypeEnum } from '@interfaces/Token.Interface';
import { Schema, model } from 'mongoose';

const TokenSchema = new Schema<TokenInterface>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    code: String,
    type: { type: String, enum: Object.values(TokenTypeEnum) },
    expiresAt: Date,
  },
  { timestamps: true },
);

const Token = model('Token', TokenSchema);

export default Token;
