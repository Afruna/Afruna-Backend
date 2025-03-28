import { VendorCategoryInterface } from '@interfaces/Vendor.Category.Interface';
import { Schema, model } from 'mongoose';

const VendorCategorySchema = new Schema<VendorCategoryInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    icon: String,
  },
  {
    timestamps: true,
  },
);

// CategorySchema.virtual('products', {
//   ref: 'Product',
//   localField: '_id',
//   foreignField: 'categoryId',
// });

// // Ensure virtual fields are included when converting to JSON
// CategorySchema.set('toJSON', { virtuals: true });
// CategorySchema.set('toObject', { virtuals: true });

// CategorySchema.pre('save', async function (next) {
//   const category = this;
//   if (category.parent) {
//     const parentCategory = await ProductCategory.findById(category.parent);
//     parentCategory!.children.push(category._id);
//     await parentCategory!.save();
//   }
//   next();
// });

const VendorCategory = model('VendorCategory', VendorCategorySchema);

export default VendorCategory;
