import HttpError from '@helpers/HttpError';
import { MainCategoryInterface } from '@interfaces/MainCategory.Interface';
import { ProductSpecInterface } from '@interfaces/Product.Spec.Interface';
import MainCategoryRepository from '@repositories/MainCategory.repo';
import Service from '@services/service';
import { logger } from '@utils/logger';
// import { logger } from '@utils/logger';
// import s3 from '@helpers/multer';
// import { OPTIONS } from '@config';

class MainCategoryService extends Service<MainCategoryInterface, MainCategoryRepository> {
  private static _instance: MainCategoryService;
  protected repository = new MainCategoryRepository();


  static instance() {
    if (!MainCategoryService._instance) {
        MainCategoryService._instance = new MainCategoryService();
    }
    return MainCategoryService._instance;
  }

  async updateSpec(Id: string, data: ProductSpecInterface[]) {
    const spec = await this.custom().findByIdAndUpdate({ _id: Id }, {
      $addToSet: { specifications: { $each: data } },
    });
    if (!spec) throw new HttpError('not found', 404);

    return spec;
  }
}

export default MainCategoryService;
