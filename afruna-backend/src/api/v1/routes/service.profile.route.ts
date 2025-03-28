/* eslint-disable import/no-unresolved */
import ServiceProfileController from '@controllers/service.profile.controller';
import { serviceProfileRequestDTO } from '@dtos/service.profile.dto';
import { ServiceProfileInterface } from '@interfaces/Service.Profile.Interface';
import Route from '@routes/route';

class ServiceProfileRoute extends Route<ServiceProfileInterface> {
  controller = new ServiceProfileController('serviceProfile');
  dto = serviceProfileRequestDTO;
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
      .route('/:serviceProfileId')
      .put(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default ServiceProfileRoute;
