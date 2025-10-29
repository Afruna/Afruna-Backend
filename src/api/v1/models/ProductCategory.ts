import { CategoryInterface } from '@interfaces/Category.Interface';
import { Schema, model } from 'mongoose';

const CategorySchema = new Schema<CategoryInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    isMainCategory: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    options: [String],
    icon: String,
  },
  {
    timestamps: true,
  },
);

CategorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId',
});

// Ensure virtual fields are included when converting to JSON
CategorySchema.set('toJSON', { virtuals: true });
CategorySchema.set('toObject', { virtuals: true });

CategorySchema.pre('save', async function (next) {
  const category = this;
  if (category.parent) {
    const parentCategory = await ProductCategory.findById(category.parent);
    parentCategory!.children.push(category._id);
    await parentCategory!.save();
  }
  else {
    category.isMainCategory = true;
    await category.save();
  }
  next();
});

const ProductCategory = model('Category', CategorySchema);

export default ProductCategory;
