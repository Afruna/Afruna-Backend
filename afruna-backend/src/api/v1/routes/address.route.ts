/* eslint-disable import/no-unresolved */
import AddressController from '@controllers/address.controller';
import { addressRequestDTO } from '@dtos/address.dto';
import { AddressInterface } from '@interfaces/Address.Interface';
import Route from '@routes/route';

class AddressRoute extends Route<AddressInterface> {
  controller = new AddressController('address');
  dto = addressRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get(this.authorize(), this.controller.getByUserId)
      .post(
        this.authorize(),
        this.validator(this.dto.create),
        this.controller.create,
      );

    this.router
      .route('/:addressId')
      .put(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
      .patch(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.setAsDefault)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default AddressRoute;
