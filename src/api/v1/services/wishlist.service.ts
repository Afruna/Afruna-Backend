import HttpError from '@helpers/HttpError';
import { WishlistInterface } from '@interfaces/Wishlist.Interface';
import WishlistRepository from '@repositories/Wishlist.repo';
import Service from '@services/service';
import ProductService from './product.service';
import { logger } from '@utils/logger';

class WishlistService extends Service<WishlistInterface, WishlistRepository> {
  protected repository = new WishlistRepository();
  private _productService = ProductService.instance;
  private static _instance: WishlistService;

  // async add(query: { userId?: string; sessionId: string }, productId: string) {
  //   let wishlistDoc;
  //   let productDoc;

  //   productDoc = await this._productService().findOne(productId);

  //   if (!productDoc) {
  //     throw new HttpError('invalid productId', 404);
  //   }

  //   wishlistDoc = await this.findOne(
  //     {},
  //     { or: [{ userId: <string>query.userId }, { sessionId: <string>query.sessionId }] },
  //   );

  //   if (!wishlistDoc) {
  //     wishlistDoc = await this.create({ userId: query.userId, sessionId: query.sessionId, productsId: [productId] });
  //   }

  //   wishlistDoc = await this.update(wishlistDoc._id, { load: { key: 'productsId', value: productId, toSet: true } });

  //   return wishlistDoc;
  // }

  async add(query: { userId?: string; sessionId: string }, productId: string) {
    let wishlistDoc;
    let productDoc;

    productDoc = await this._productService().findOne(productId);

    if (!productDoc) {
      throw new HttpError('invalid productId', 404);
    }

    wishlistDoc = await this.findOne(
      { userId: <string>query.userId }
    );

    if (!wishlistDoc) {
      wishlistDoc = await this.create({ userId: query.userId, sessionId: query.sessionId, productsId: [productId] });
    }
    else 
      wishlistDoc = await this.update(wishlistDoc._id, { load: { key: 'productsId', value: productId, toSet: true } });

    return wishlistDoc;
  }

  // async getOne(sessionId: string, userId?: string) {
  //   let wishlistDoc;

  //   wishlistDoc = await this.repository.findPopulatedOne({ or: [{ userId }, { sessionId }] }, {})

  //   if (wishlistDoc && !wishlistDoc.userId && userId) {
  //     wishlistDoc = await this.update(wishlistDoc._id, { userId });
  //   }

  //   return wishlistDoc;
  // }


  async getOne(sessionId: string, userId?: string) {
    let wishlistDoc;

    wishlistDoc = await this.findOne({ userId }, { populate: {
      path: 'productsId',
      model: 'Product',
    }})

    // if (wishlistDoc && !wishlistDoc.userId && userId) {
    //   wishlistDoc = await this.update(wishlistDoc._id, { userId });
    // }

    return wishlistDoc;
  }


  // async getWishlist(sessionId: string, userId?: string) {
  //   let wishlistDoc;

  //   wishlistDoc = await this.repository.custom().

  //   if (wishlistDoc && !wishlistDoc.userId && userId) {
  //     wishlistDoc = await this.update(wishlistDoc._id, { userId });
  //   }

  //   return wishlistDoc;
  // }

  async remove(query: { userId?: string; sessionId: string }, productId: string) {
    let wishlistDoc;
    let productDoc;

    productDoc = await this._productService().findOne(productId);

    if (!productDoc) {
      throw new HttpError('invalid productId', 404);
    }

    wishlistDoc = await this.findOne(
      {},
      { or: [{ userId: <string>query.userId }, { sessionId: <string>query.sessionId }] },
    );

    if (!wishlistDoc) {
      wishlistDoc = await this.create({ userId: query.userId, sessionId: query.sessionId, productsId: [productId] });
    }

    wishlistDoc = await this.update(wishlistDoc._id, {
      unload: { field: 'productsId', value: productId, key: <keyof WishlistInterface>'' },
    });

    return wishlistDoc;
  }

  static instance() {
    if (!WishlistService._instance) {
      WishlistService._instance = new WishlistService();
    }
    return WishlistService._instance;
  }
}

export default WishlistService;
