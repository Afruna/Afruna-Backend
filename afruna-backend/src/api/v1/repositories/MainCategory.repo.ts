import { MainCategoryInterface } from '@interfaces/MainCategory.Interface';
import MainCategory from '@models/MainCategory';
import Repository from '@repositories/repository';

export default class MainCategoryRepository extends Repository<MainCategoryInterface> {
  protected model = MainCategory;
}
