/* eslint-disable import/no-unresolved */
import ReturnAddressController from '@controllers/return.address.controller';
import { returnAddressRequestDto } from '@dtos/return.address.dto';
import { ReturnAddressInterface } from '@interfaces/Return.Address.Interface';
import Route from '@routes/route';

class ReturnAddressRoute extends Route<ReturnAddressInterface> {
  controller = new ReturnAddressController('returnAddress');
  dto = returnAddressRequestDto;
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
      .route('/:returnAddressId')
      .put(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default ReturnAddressRoute;
