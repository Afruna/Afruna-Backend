import { ProductInterface } from '@interfaces/Product.Interface';
import { Schema, model } from 'mongoose';
import { customIdPlugin } from './IdPlugin';
import { ProductStatus, ProductType, VendorProductInterface } from '@interfaces/Vendor.Product.Interface';

const VendorProductSchema = new Schema<VendorProductInterface>(
  {
    name: String,
    productType: { type: String, enum: Object.values(ProductType), default: ProductType.SERVICE },
    productStatus: { type: String, enum: Object.values(ProductStatus), default: ProductStatus.IN_STOCK },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'VendorCategory',
    },
    price: { type: Number, default: 0 },
    discount: Number,
    productDetails: String,
    images: [String],
    ratings: { type: Number, default: 0 },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    }
  },
  { timestamps: true },
);

// ProductSchema.methods.discountedPrice = function () {
//   return this.discount ? this.price * (this.discount / 100) : this.price;
// };

// ProductSchema.plugin(customIdPlugin, { modelName: 'Product' });

const VendorProduct = model('VendorProduct', VendorProductSchema);

export default VendorProduct;
