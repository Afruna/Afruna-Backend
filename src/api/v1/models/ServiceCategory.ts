import { CategoryInterface } from '@interfaces/Category.Interface';
import { Schema, model } from 'mongoose';

const CategorySchema = new Schema<CategoryInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    // parent: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Category',
    // },
    // children: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Category',
    //   },
    // ],
    options: [String],
    icon: String,
  },
  {
    timestamps: true,
  },
);

// CategorySchema.virtual('services', {
//   ref: 'Service',
//   localField: '_id',
//   foreignField: 'categoryId',
// });

// CategorySchema.pre('save', async function (next) {
//   const category = this;
//   if (category.parent) {
//     const parentCategory = await ServiceCategory.findById(category.parent);
//     parentCategory!.children.push(category._id);
//     await parentCategory!.save();
//   }
//   next();
// });

const ServiceCategory = model('ServiceCategory', CategorySchema);

export default ServiceCategory;
