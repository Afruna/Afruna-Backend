/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import MainCategoryService from '@services/mainCategory.service';
import { MainCategoryInterface } from '@interfaces/MainCategory.Interface';

class MainCategoryController extends Controller<MainCategoryInterface> {
  service = new MainCategoryService();
  responseDTO = undefined; // CategoryResponseDTO.Category;


  get = this.control((req: Request) => {
    return this.service.paginatedFind(<any>this.safeQuery(req), undefined, [ 
      {
        path: 'categories',
        model: 'Category',
      }, 
    ]);
  });

  getOne = this.control(async (req: Request) => {
    const result = await this.service.findOne(req.params[this.resourceId], {
      populate: {
        path: 'categories',
        model: 'Category',
      }, 
    });
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getFeatured = this.control(async (req: Request) => {
    return this.service.paginatedFind(<any>this.safeQuery(req), undefined, [
      {
        path: 'categories',
        model: 'Category',
      }, 
    ]);
  });

  updateSpec = this.control(async (req: Request) => {
    console.log(req.params[this.resourceId])
    return this.service.updateSpec(req.params[this.resourceId], req.body);
  });

}

export default MainCategoryController;
