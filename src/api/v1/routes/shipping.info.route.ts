/* eslint-disable import/no-unresolved */
import ShippingInfoController from '@controllers/shipping.info.controller';
import { shippingInfoRequestDTO } from '@dtos/shipping.info.dto';
import { ShippingInfoInterface } from '@interfaces/Shipping.Info.Interface';
import Route from '@routes/route';

class ShippingInfoRoute extends Route<ShippingInfoInterface> {
  controller = new ShippingInfoController('shippingInfo');
  dto = shippingInfoRequestDTO;
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
      .route('/:shippingInfoId')
      .put( this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default ShippingInfoRoute;
