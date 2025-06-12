/* eslint-disable import/no-unresolved */
import AdditionalInfoController from '@controllers/additional.info.controller';
import { additionalInfoRequestDTO } from '@dtos/additional.info.dto';
import { AdditionalInfoInterface } from '@interfaces/Additional.Info.Interface';
import Route from '@routes/route';

class AdditionalInfoRoute extends Route<AdditionalInfoInterface> {
  controller = new AdditionalInfoController('additionalInfo');
  dto = additionalInfoRequestDTO;
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
      .route('/:additionalInfoId')
      .put(this.controller.update) //add authorize
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default AdditionalInfoRoute;
