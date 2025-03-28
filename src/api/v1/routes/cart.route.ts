/* eslint-disable import/no-unresolved */
import CartController from '@controllers/cart.controller';
import { cartRequestDTO } from '@dtos/cart.dto';
import Route from '@routes/route';
import { CartInterface } from '@interfaces/Cart.Interface';
import { cartSessionMiddleware } from '@middlewares/session';

class CartRoute extends Route<CartInterface> {
  controller = new CartController('cart');
  dto = cartRequestDTO;
  initRoutes() {
    this.router.use(cartSessionMiddleware);
    this.router
      .route('/')
      .get(this.getUser(), this.controller.get)
      .post(this.getUser(), this.validator(this.dto.productId), this.controller.add)
      .delete(this.getUser(), this.controller.removeAll);
    this.router.delete('/:productId', this.getUser(), this.validator(this.dto.id), this.controller.remove);
    this.router.delete('/:productId/item', this.getUser(), this.validator(this.dto.id), this.controller.removeItem);

    return this.router;
  }
}
export default CartRoute;
