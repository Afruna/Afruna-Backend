/* eslint-disable import/no-unresolved */
import BusinessDetailController from '@controllers/business.detail.controller';
import { businessDetailRequestDTO } from '@dtos/business.detail.dto';
import { BusinessDetailInterface } from '@interfaces/Business.Detail.Interface';
import Route from '@routes/route';

class BusinessDetailRoute extends Route<BusinessDetailInterface> {
  controller = new BusinessDetailController('businessDetail');
  dto = businessDetailRequestDTO;
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
      .route('/:businessDetailId')
      .put(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default BusinessDetailRoute;
