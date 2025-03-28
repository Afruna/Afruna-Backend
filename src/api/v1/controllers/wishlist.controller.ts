/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import WishlistService from '@services/wishlist.service';
import { WishlistInterface } from '@interfaces/Wishlist.Interface';
import Controller from '@controllers/controller';
// import { WishlistResponseDTO } from '@dtos/Wishlist.dto';

class WishlistController extends Controller<WishlistInterface> {
  service = new WishlistService();
  responseDTO = undefined; // WishlistResponseDTO.Wishlist;

  getOne = this.control((req: Request) => {
    return this.service.getOne(req.session.cartId!, req.user?._id);
  });

  add = this.control(async (req: Request) => {
    const result = await this.service.add(
      { userId: req.user?._id, sessionId: req.session.cartId! },
      req.body.productId,
    );
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  remove = this.control(async (req: Request) => {
    const result = await this.service.remove(
      { userId: req.user?._id, sessionId: req.session.cartId! },
      req.params.productId,
    );
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  removeAll = this.control(async (req: Request) => {
    const result = await this.service.remove(
      { userId: req.user?._id, sessionId: req.session.cartId! },
      req.params.productId,
    );
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
}

export default WishlistController;
