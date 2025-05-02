import Category, { CategoryInterface } from '@models/Category';
import Repository from '@repositories/repository';

export default class CategoryRepository extends Repository<CategoryInterface> {
  protected model = Category;
};