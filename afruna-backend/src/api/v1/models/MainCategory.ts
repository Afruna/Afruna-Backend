import { MainCategoryInterface } from '@interfaces/MainCategory.Interface';
import { Schema, model } from 'mongoose';
import { ProductSpecSchema } from './ProductSpec';

const MainCategorySchema = new Schema<MainCategoryInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    image: String,
    specifications: [ProductSpecSchema],
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
  },
  {
    timestamps: true,
  },
);

const MainCategory = model('MainCategory', MainCategorySchema);

export default MainCategory;