/* eslint-disable import/no-unresolved */
import CategoryController from '@controllers/serviceCategory.controller';
import { categoryRequestDTO } from '@dtos/category.dto';
import Route from '@routes/route';
import { CategoryInterface } from '@interfaces/Category.Interface';

class CategoryRoute extends Route<CategoryInterface> {
  controller = new CategoryController('category');
  dto = categoryRequestDTO;
  initRoutes() {
    this.router
      .route('/:categoryId/options')
      .put(this.validator(this.dto.options.concat(this.dto.id)), this.controller.addOptions)
      .delete(this.validator(this.dto.option.concat(this.dto.id)), this.controller.removeOption);

    this.router.get('/', this.controller.get);
    this.router.post(
      '/',
      this.fileProcessor.uploadOne('icon'),
      this.validator(this.dto.create),
      this.controller.create,
    );

    this.router
      .route('/:categoryId')
      .get(this.validator(this.dto.id), this.controller.getOne)
      .put(
        this.fileProcessor.uploadOne('icon'),
        this.validator(this.dto.update.concat(this.dto.id)),
        this.controller.update,
      )
      .delete(this.validator(this.dto.id), this.controller.delete);
    // this.router.route('/:categoryId/service').get(this.validator(this.dto.id), this.controller.getNested);
    this.router.route('/:categoryId/sub').get(this.validator(this.dto.id), this.controller.getSub);
    return this.router;
  }
}
export default CategoryRoute;
