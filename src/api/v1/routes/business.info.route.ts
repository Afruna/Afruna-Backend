/* eslint-disable import/no-unresolved */
import BusinessInfoController from '@controllers/business.info.controller';
import { businessInfoRequestDTO } from '@dtos/business.info.dto';
import { BusinessInfoInterface } from '@interfaces/Business.Info.Interface';
import Route from '@routes/route';

class BusinessInfoRoute extends Route<BusinessInfoInterface> {
  controller = new BusinessInfoController('businessInfo');
  dto = businessInfoRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get(this.authorizeVendor(), this.controller.getByVendorId)
      .post(
        this.authorizeVendor(),
        this.validator(this.dto.create),
        this.controller.create,
      );

    this.router
      .route('/:businessInfoId')
      .put( this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default BusinessInfoRoute;
