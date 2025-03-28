import { CartSessionInterface } from '@interfaces/Cart.Interface';
import CartSession from '@models/CartSession';
import Repository from '@repositories/repository';

class CartSessionRepository extends Repository<CartSessionInterface> {
  protected model = CartSession;
}

export default CartSessionRepository;
