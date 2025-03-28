import { CartInterface } from '@interfaces/Cart.Interface';
import { Schema, model } from 'mongoose';
import { customIdPlugin } from './IdPlugin';

const CartSchema = new Schema<CartInterface>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'CartSession',
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: Number,
    total: Number,
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    customId: String,
    options: Schema.Types.Mixed,
  },
  { timestamps: true },
);

CartSchema.plugin(customIdPlugin, { modelName: 'Cart' });

const Cart = model('Cart', CartSchema);

export default Cart;
