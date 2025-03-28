import { CartInterface } from '@interfaces/Cart.Interface';
import Cart from '@models/Cart';
import Repository from '@repositories/repository';

class CartRepository extends Repository<CartInterface> {
  protected model = Cart;
}

export default CartRepository;
