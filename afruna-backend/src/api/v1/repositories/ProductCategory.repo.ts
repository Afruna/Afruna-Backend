import { CategoryInterface } from '@interfaces/Category.Interface';
import Category from '@models/ProductCategory';
import Repository from '@repositories/repository';

export default class ProductCategoryRepository extends Repository<CategoryInterface> {
  protected model = Category;
}
