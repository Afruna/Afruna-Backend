import { ProductInterface, ProductStatus } from '@interfaces/Product.Interface';
import { Schema, model } from 'mongoose';
import { customIdPlugin } from './IdPlugin';
import { Query } from 'mongoose';

const ProductSchema = new Schema<ProductInterface>(
  {
    name: String,
    desc: String,
    quantity: Number,
    isPromoted: { type: Boolean, default: false },
    sold: { type: Number, default: 0 },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    mainCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'MainCategory',
    },
    price: Number,
    skuNumber: String,
    discount: Number,
    images: [String],
    coverPhoto: [String],
    ratings: { type: Number, default: 0 },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    options: Schema.Types.Mixed,
    metaData: [String],
    deliveryLocations: [String],
    isOutOfStock: { type: Boolean, default: false },
    ratedBy: { type: Number, default: 0 },
    customId: String,
    frequency: { type: Number, default: 0 },
    weight: { type: Number, default: 0.1 },
    hype: Boolean,
    inWishlist: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    totalScore: { type: Number, default: 0 },
    viewed: {
      type: Date
    },
    status: { type: String, enum: Object.values(ProductStatus), default: ProductStatus.DRAFT },  
    rejectionReason: String,  
  },
  { timestamps: true },
);

ProductSchema.methods.discountedPrice = function () {
  return this.discount ? this.price * (this.discount / 100) : this.price;
};

ProductSchema.pre(/^find/, function (this: Query<any, any>, next) {
  this.sort({ createdAt: -1 });
  next();
});

ProductSchema.plugin(customIdPlugin, { modelName: 'Product' });

const Product = model('Product', ProductSchema);

export default Product;
