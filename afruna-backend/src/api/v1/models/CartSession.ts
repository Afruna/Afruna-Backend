import { CartSessionInterface } from '@interfaces/Cart.Interface';
import { Schema, model } from 'mongoose';
import { customIdPlugin } from './IdPlugin';

const CartSessionSchema = new Schema<CartSessionInterface>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: { type: String, required: true, unique: true },
    numberOfItems: Number,
    total: Number,
    customId: String,
  },
  { timestamps: true },
);

CartSessionSchema.plugin(customIdPlugin, { modelName: 'CartSession' });

const CartSession = model('CartSession', CartSessionSchema);

export default CartSession;
