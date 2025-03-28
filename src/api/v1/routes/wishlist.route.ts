/* eslint-disable import/no-unresolved */
import WishlistController from '@controllers/wishlist.controller';
import { wishlistRequestDTO } from '@dtos/wishlist.dto';
import Route from '@routes/route';
import { WishlistInterface } from '@interfaces/Wishlist.Interface';
import { cartSessionMiddleware } from '@middlewares/session';

class WishlistRoute extends Route<WishlistInterface> {
  controller = new WishlistController('wishlist');
  dto = wishlistRequestDTO;
  initRoutes() {
    this.router.use(cartSessionMiddleware);
    this.router.route('/').get(this.controller.getOne).post(this.validator(this.dto.add), this.controller.add);
    this.router.route('/:productId').delete(this.validator(this.dto.id), this.controller.remove);

    return this.router;
  }
}
export default WishlistRoute;
