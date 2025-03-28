/* eslint-disable import/no-unresolved */
import MainCategoryController from '@controllers/mainCategory.controller';
import { mainCategoryRequestDTO } from '@dtos/main.category.dto';
import { MainCategoryInterface } from '@interfaces/MainCategory.Interface';
import Route from '@routes/route';

class MainCategoryRoute extends Route<MainCategoryInterface> {
  controller = new MainCategoryController('maincategory');
  dto = mainCategoryRequestDTO;
  initRoutes() {

    this.router.get('/featured', this.controller.getFeatured);
    
    this.router.get('/', this.controller.get);
    this.router.post(
      '/',
    //   this.authorize(),
    //   this.accessControl(['category'], 'create'),
    //   this.fileProcessor.uploadOne('icon'),
      this.validator(this.dto.create),
      this.controller.create,
    );
    
    this.router
      .route('/:maincategoryId')
      .get(this.validator(this.dto.id), this.controller.getOne)
      .put(
        //this.authorizeVendor(),
        //this.accessControl(['product'], 'update'),
        
        this.validator(this.dto.update.concat(this.dto.id)),
        this.controller.update,
      )
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);


      this.router
      .route('/specs/:maincategoryId')
      .put(
        this.controller.updateSpec,
      )

    return this.router;
  }
}
export default MainCategoryRoute;
