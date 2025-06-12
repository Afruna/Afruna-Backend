/* eslint-disable import/no-unresolved */
import ProvideController from '@controllers/provide.controller';
import Route from '@routes/route';
import { ProvideInterface } from '@interfaces/Provide.Interface';
import { provideRequestDTO } from '@dtos/provide.dto';
import { UserRole } from '@interfaces/User.Interface';
// import { authorize } from '@middlewares/jwt';

export default class ProvideRoute extends Route<ProvideInterface> {
  dto = provideRequestDTO;
  controller = new ProvideController('service');
  initRoutes() {
    this.router
      .route('/')
      .get(this.authorizeVendor(), this.controller.get)
      .post(
        this.authorizeVendor(),
        // this.fileProcessor.uploadField<ProvideInterface>([
        //   { name: 'licenseAndCertification', maxCount: 10 },
        //   { name: 'insuranceCoverage', maxCount: 10 },
        // ]),
        this.validator(this.dto.create),
        this.controller.create,
      );
      
    this.router.route('/search').get(this.controller.searchByName);


    
    this.router
      .route('/my/:serviceId')
      .get(this.validator(this.dto.id), this.controller.getOne)
      .put( this.validator(this.dto.id.concat(this.dto.update)), this.controller.update)
      .delete(this.authorizeVendor(), this.validator(this.dto.id), this.controller.delete);

    this.router.route('/popular').get(this.controller.getPopular);

    this.router.route('/similar-services/:serviceId').get(this.validator(this.dto.id), this.controller.getSimilarServices);

    this.router.route('/top').get(this.controller.getTop);

    this.router.route('/all').get(this.controller.getAll);

    this.router.route('/search').get(this.controller.searchByName);

    this.router
      .route('/provider')
      .get(this.authorizeVendor(), this.controller.getWithProviderId);

    this.router
      .route('/provider/:providerId')
      .get(this.controller.getByProviderId);

    this.router
      .route('/:serviceId/verify')
      .put(this.authorize(UserRole.ADMIN), this.validator(this.dto.id), this.controller.verify);
    this.router
      .route('/:serviceId/publish')
      .put(this.authorize(UserRole.PROVIDER), this.validator(this.dto.id), this.controller.publish);

    this.router
      .route('/:providerId/cards')
      .get(this.authorize(), this.validator(this.dto.providerId), this.controller.providerCard);

    this.router
      .route('/:customerId/customer/cards')
      .get(this.authorize(), this.validator(this.dto.customerId), this.controller.customerCard);

    this.router
      .route('/:categoryId/category')
      .get(this.authorize(), this.validator(this.dto.categoryId), this.controller.getWithCategoryId);

    return this.router;
  }
}
