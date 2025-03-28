import { WishlistInterface } from '@interfaces/Wishlist.Interface';
import { Schema, model } from 'mongoose';

const WishlistSchema = new Schema<WishlistInterface>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: {
      type: String,
    },
    productsId: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true },
);

const Wishlist = model('Wishlist', WishlistSchema);

export default Wishlist;