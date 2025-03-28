import { Types } from 'mongoose';
import { ProductSpecInterface } from './Product.Spec.Interface';

export interface MainCategoryInterface {
  name: string;
  image: string;
  categories?: Array<string | Types.ObjectId>;
  specifications: Array<ProductSpecInterface>;
}

export interface Option {
  name: string;
  label: string;
}