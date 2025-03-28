/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import CartService from '@services/cart.service';
import { CartInterface } from '@interfaces/Cart.Interface';
import Controller from '@controllers/controller';
import { logger } from '@utils/logger';
// import { CartResponseDTO } from '@dtos/cart.dto';

class CartController extends Controller<CartInterface> {
  service = new CartService();
  responseDTO = undefined; // CartResponseDTO.Cart;

  get = this.control(async (req: Request) => {
    const result = await this.service.get(req.user?._id, req.session.cartId!);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  add = this.control(async (req: Request) => {
    const result = await this.service.add({
      productId: req.body.productId,
      userId: req.user?._id,
      optionId: req.body.optionId,
      quantity: req.body.quantity,
      sessionId: req.session.cartId!,
    });
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  remove = this.control(async (req: Request) => {
    const result = await this.service.remove(req.params.productId, req.user?._id, req.session.cartId!);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  removeItem = this.control(async (req: Request) => {
    const result = await this.service.deleteCart({
      productId: req.params.productId,
      userId: req.user?._id,
      _sessionId: req.session.cartId!,
    });
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  removeAll = this.control(async (req: Request) => {
    const result = await this.service.deleteAll(req.user?._id);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
}

export default CartController;
