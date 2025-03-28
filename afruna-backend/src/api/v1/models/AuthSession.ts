/* eslint-disable func-names */
import { AuthSessionInterface } from '@interfaces/AuthSession.Interface';
import { model, Schema, Model } from 'mongoose';

const sessionSchema = new Schema<AuthSessionInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    token: { type: String, required: [true, 'The token is required'] },
    isLoggedIn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
// sessionSchema.methods.

export default <Model<AuthSessionInterface>>model('session', sessionSchema);
