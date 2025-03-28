import { CategoryInterface } from '@interfaces/Category.Interface';
import Category from '@models/ServiceCategory';
import Repository from '@repositories/repository';

export default class ServiceCategoryRepository extends Repository<CategoryInterface> {
  protected model = Category;
}
