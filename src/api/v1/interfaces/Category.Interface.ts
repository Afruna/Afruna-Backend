import { Types } from 'mongoose';

export interface CategoryInterface {
  name: string;
  isMainCategory: boolean;
  parent: string | Types.ObjectId;
  icon: string;
  children: Array<string | Types.ObjectId>;
  products?: any;
  services?: any;
  options: string[];
}
