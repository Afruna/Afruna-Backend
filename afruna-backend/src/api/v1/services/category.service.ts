import HttpError from '@helpers/HttpError';
import { CategoryInterface } from '@interfaces/Category.Interface'
import MainCategoryRepository from '@repositories/MainCategory.repo';
import ProductRepository from '@repositories/Product.repo';
import CategoryRepository from '@repositories/ProductCategory.repo';
import Service from '@services/service';
import { logger } from '@utils/logger';
// import { logger } from '@utils/logger';
// import s3 from '@helpers/multer';
// import { OPTIONS } from '@config';

class CategoryService extends Service<CategoryInterface, CategoryRepository> {
  private static _instance: CategoryService;
  protected repository = new CategoryRepository();
  protected mainCategoryRepo = new MainCategoryRepository()
  protected productRepo = new ProductRepository()

  async getCategoriesToBrowse(query: Record<string, any>) {
    return this.paginatedFind(query, { name: 1 }, [
      {
        path: 'mainCategory',
        model: 'MainCategory'
      }
    ])
  }

  async getPoular(query: Record<string, any>) {
    return this.paginatedFind(query, { name: 1 }, [
      {
        path: 'mainCategory',
        model: 'MainCategory'
      }
    ])
  }

  async getAllProductsInNestedCategories(categoryId: string) {
    // const mainCategory = await this.mainCategoryRepo.findOne({_id: categoryId });
    // if (!mainCategory) throw new HttpError('not found', 404);
    let products = [];

    let categories = await this.repository.find({mainCategory: categoryId});



    // Recursively collect products from all child categories
    for (const childCategory of categories) {
      const childCategoryProducts = await this.productRepo.find({categoryId: <string>childCategory._id });
      products = [...products, ...childCategoryProducts];
    }

    return products;
  }

  async nestedCategories(categoryId: string) {
    const category = await this.custom().findById(categoryId).populate({ path: 'children', populate: 'products' });
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
