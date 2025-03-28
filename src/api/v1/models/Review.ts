import { ReviewInterface } from '@interfaces/Review.Interface';
import { Schema, model } from 'mongoose';

const ReviewSchema = new Schema<ReviewInterface>(
  {
    rating: Number,
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
    },
    comment: String
  },
  { timestamps: true },
);

const Review = model('Review', ReviewSchema);

export default Review;
