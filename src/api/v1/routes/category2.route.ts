/* eslint-disable import/no-unresolved */
import Category2Controller from '@controllers/category2.controller';
import { categoryRequestDTO } from '@dtos/category.dto';
import { CategoryInterface } from '@models/Category';
import Route from '@routes/route';

class Category2Route extends Route<CategoryInterface> {
  controller = new Category2Controller('category2');
  dto = null;

  initRoutes() {

    // this.router
    // .route('/getByMainCategory/:maincategory')
    // .get(this.validator(this.dto.maincategory), this.controller.getMainCategory)

    // this.router
    // .route('/categoriesToBrowse')
    // .get(this.controller.getCategoriesToBrowse)

    // this.router
    // .route('/popular')
    // .get(this.controller.getCategoriesToBrowse)

    // this.router
    //   .route('/:categoryId/options')
    //   .put(this.validator(this.dto.options.concat(this.dto.id)), this.controller.addOptions)
    //   .delete(this.validator(this.dto.option.concat(this.dto.id)), this.controller.removeOption);

    this.router.get('/', this.controller.get);
    this.router.post(
      '/',
      // this.authorize(),
      // this.accessControl(['category'], 'create'),
      // this.fileProcessor.uploadOne('icon'),
      this.controller.create,
    );

    // Parent categories route
    this.router.get('/parents', this.controller.getParentCategories);

    // Subcategories routes
    this.router.get('/:categoryId/subcategories', this.controller.getSubcategories);
    this.router.post('/:categoryId/subcategories', this.controller.addSubcategory);

    this.router
      .route('/:category2Id')
      // .get(this.validator(this.dto.id), this.controller.getOne)
      .put( this.controller.update)
      .delete(this.controller.delete);

    // this.router.route('/:categoryId/nested').get(this.validator(this.dto.id), this.controller.getNested);
    return this.router;
  };
}

export default Category2Route;