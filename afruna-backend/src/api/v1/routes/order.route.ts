/* eslint-disable import/no-unresolved */
import OrderController from '@controllers/order.controller';
import { orderRequestDTO } from '@dtos/order.dto';
import Route from '@routes/route';
import { OrderInterface } from '@interfaces/Order.Interface';

class OrderRoute extends Route<OrderInterface> {
  controller = new OrderController('order');
  dto = orderRequestDTO;
  initRoutes() {
    this.router.get('/', this.authorize(), this.controller.get);
    this.router.get('/me', this.authorize(), this.controller.getUserOrders);
    this.router.get('/vendor', this.authorizeVendor(), this.controller.getVendorOrder);
    this.router.get('/addresses', this.authorize(), this.controller.getAddresses);
    this.router.post('/checkout', this.authorize(), this.validator(this.dto.create), this.controller.create);
    this.router.get('/session/:sessionRef', this.authorize(), this.controller.getSession);
    this.router.get('/track/:ref', this.authorize(), this.controller.trackOrder);
    this.router.get('/:ref', this.authorize(), this.controller.getOne);

    return this.router;
  }
}
export default OrderRoute;
