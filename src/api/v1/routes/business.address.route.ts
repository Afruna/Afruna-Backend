/* eslint-disable import/no-unresolved */
import BusinessAddressController from '@controllers/business.address.controller';
import { businessAddressRequestDto } from '@dtos/business.address.dto';
import { BusinessAddressInterface } from '@interfaces/Business.Address.Interface';
import Route from '@routes/route';

class BusinessAddressRoute extends Route<BusinessAddressInterface> {
  controller = new BusinessAddressController('businessAddress');
  dto = businessAddressRequestDto;
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
      .route('/:businessAddressId')
      .put(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default BusinessAddressRoute;
