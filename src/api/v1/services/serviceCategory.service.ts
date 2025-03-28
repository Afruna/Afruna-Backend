import HttpError from '@helpers/HttpError';
import { CategoryInterface } from '@interfaces/Category.Interface';
import CategoryRepository from '@repositories/ServiceCategory.repo';
import Service from '@services/service';
// import { logger } from '@utils/logger';
// import s3 from '@helpers/multer';
// import { OPTIONS } from '@config';

class CategoryService extends Service<CategoryInterface, CategoryRepository> {
  private static _instance: CategoryService;
  protected repository = new CategoryRepository();

  async getAllServicesInNestedCategories(categoryId: string) {
    const category = await this.custom().findById(categoryId).populate('services');
    if (!category) throw new HttpError('not found', 404);
    let services = category.services;

    // Recursively collect services from all child categories
    for (const childCategoryId of category.children) {
      const childCategoryServices = await this.getAllServicesInNestedCategories(<string>childCategoryId);
      services = [...services, ...childCategoryServices];
    }

    return services;
  }

  async nestedCategories(categoryId: string) {
    const category = await this.custom().findById(categoryId).populate('services');
    if (!category) throw new HttpError('not found', 404);
    let categories = category.children;

    for (const childCategoryId of category.children) {
      const childCategories = await this.nestedCategories(<string>childCategoryId);
      categories = [...categories, ...childCategories];
    }

    return categories;
  }

  async addOption(categoryId: string, data: string[]) {
    const category = await this.custom().findByIdAndUpdate(categoryId, {
      $addToSet: { options: { $each: data } },
    });
    if (!category) throw new HttpError('not found', 404);

    return category;
  }

  async removeOption(categoryId: string, data: string) {
    const category = await this.custom().findByIdAndUpdate(categoryId, {
      $pull: { options: data },
    });
    if (!category) throw new HttpError('not found', 404);

    return category;
  }

  static instance() {
    if (!CategoryService._instance) {
      CategoryService._instance = new CategoryService();
    }
    return CategoryService._instance;
  }
}

export default CategoryService;
