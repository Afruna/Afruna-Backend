/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import CategoryService from '@services/serviceCategory.service';
import { CategoryInterface } from '@interfaces/Category.Interface';
import Controller from '@controllers/controller';
// import { CategoryResponseDTO } from '@dtos/Category.dto';

class CategoryController extends Controller<CategoryInterface> {
  service = new CategoryService();
  responseDTO = undefined; // CategoryResponseDTO.Category;
  getNested = this.control(async (req: Request) => {
    const result = await this.service.getAllServicesInNestedCategories(req.params[this.resourceId]);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getSub = this.control(async (req: Request) => {
    const result = await this.service.find({ parent: req.params[this.resourceId] });
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
      // {
      //   path: 'parent',
      //   model: 'Category',
      // },
    ]);
  });

  getOne = this.control(async (req: Request) => {
    const result = await this.service.findOne(req.params[this.resourceId], {
      populate: {
        path: 'parent',
        model: 'Category',
      },
    });
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
}

export default CategoryController;
