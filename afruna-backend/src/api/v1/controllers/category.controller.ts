/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import CategoryService from '@services/category.service';
import { CategoryInterface } from '@interfaces/Category.Interface';
import Controller from '@controllers/controller';
// import { CategoryResponseDTO } from '@dtos/Category.dto';

class CategoryController extends Controller<CategoryInterface> {
  service = new CategoryService();
  responseDTO = undefined; // CategoryResponseDTO.Category;

  getCategoriesToBrowse = this.control(async (req: Request) => {
    const result = await this.service.getCategoriesToBrowse(<any>this.safeQuery(req));
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getPopular = this.control(async (req: Request) => {
    const result = await this.service.getPoular(<any>this.safeQuery(req));
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getNested = this.control(async (req: Request) => {
    const result = await this.service.nestedCategories(req.params[this.resourceId]);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  addOptions = this.control(async (req: Request) => {
    const result = await this.service.addOption(req.params[this.resourceId], req.body.options);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  removeOption = this.control(async (req: Request) => {
    const result = await this.service.removeOption(req.params[this.resourceId], req.body.option);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  get = this.control((req: Request) => {
    return this.service.paginatedFind(<any>this.safeQuery(req), undefined, [
      {
        path: 'mainCategory',
        model: 'MainCategory',
      },
    ]);
  });

  getOne = this.control(async (req: Request) => {
    const result = await this.service.findOne(req.params[this.resourceId], {
      populate: {
        path: 'mainCategory',
        model: 'MainCategory',
      },
    });
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getMainCategory = this.control(async (req: Request) => {
    const mainCategory = req.params.maincategory;

    const result = await this.service.find(
      { mainCategory },
      {
        populate: {
          path: 'mainCategory',
          model: 'MainCategory'
        },
      },
    );
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
}

export default CategoryController;
