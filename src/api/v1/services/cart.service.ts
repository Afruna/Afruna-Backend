import HttpError from '@helpers/HttpError';
import { CartInterface, CartSessionInterface } from '@interfaces/Cart.Interface';
import CartRepository from '@repositories/Cart.repo';
import CartSessionRepository from '@repositories/CartSession.repo';
import Service from '@services/service';
import ProductService from './product.service';
import { logger } from '@utils/logger';

class CartService extends Service<CartInterface, CartRepository> {
  protected repository = new CartRepository();
  private _cartSession = new CartSessionRepository();
  private _productService = ProductService.instance;
  private static _instance: CartService;

  async add({
    productId,
    userId,
    optionId,
    quantity = 1,
    sessionId,
  }: {
    productId: string;
    userId: string;
    optionId?: string;
    quantity: number;
    sessionId: string;
  }) {
    const dbSession = await this.repository.RepositorySession();
    
    try {
      dbSession.startTransaction();
      let session = userId
        ? await this._cartSession.findOne({ userId })
        : await this._cartSession.findOne({ sessionId });

      const product = await this._productService().findOne(productId);
      if (!product) throw new HttpError('invalid product', 404);
      // if (product.isOutOfStock) throw new HttpError('this product is out of stock', 400);

      const discountedPrice = this._productService().discountedPrice(product);

      if (session) {
        session.numberOfItems += 1;
        session.total += this._productService().discountedPrice(product);

        if (!session.userId && userId) session.userId = userId;

        session = await this._cartSession.update(session._id, session, false, false, dbSession);
      } else {
        session = (<DocType<CartSessionInterface>[]>(
          (<unknown>(
            await this._cartSession.create(
              [{ sessionId, userId, total: discountedPrice, numberOfItems: 1 }],
              dbSession,
            )
          ))
        ))[0];
      }
      const options = [];
      let _option = null;
      if (optionId) {
        const option = product.options.find((v) => optionId === (<any>v)._id.toString());
        if (!option) throw new HttpError('invalid optionId', 404);
        if (option.availableQuantity === 0) throw new HttpError('selected option is out of stock', 400);
        delete (<any>option).availableQuantity;
        delete (<any>option).quantity;
        _option = option;
        options.push(option);
      }
      const cart = await this.findOne({ productId, sessionId: session!._id });
      if (cart) {
        if (cart.quantity + product.sold + Number(quantity) > product.quantity) {
          throw new HttpError('cannot add. product is out of stock', 400);
        }
        if (optionId) {
          const productOptionExists = cart.options.find((v) => v._id === optionId);
          if (productOptionExists) {
            if (_option!.availableQuantity - Number(quantity) < 0)
              throw new HttpError('cannot add. product option has only  ' + _option?.availableQuantity + ' left', 400);
          }
        }
        await this.repository.update(
          cart._id,
          {
            quantity: cart.quantity + Number(quantity),
            total: cart.total + discountedPrice,
            options,
          },
          false,
          false,
          dbSession,
        );
      } else {
        await this.repository.create(
          [
            {
              productId,
              options,
              sessionId: session?._id,
              quantity,
              total: discountedPrice,
              vendorId: product.vendorId,
              vendor: product.vendor
            },
          ],
          dbSession,
        );
      }
      await dbSession.commitTransaction();
      return session!;
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      dbSession.endSession();
    }
  }

  async deleteCart(data: { productId: string; userId: string; _sessionId: string }) {
    const userId = data.userId;
    const productId = data.productId;
    let session = userId
      ? await this._cartSession.findOne({ userId })
      : await this._cartSession.findOne({ sessionId: data._sessionId });
    const product = await this._productService().findOne(productId);
    if (!product) throw new HttpError('invalid product', 404);
    if (!session) throw new HttpError('invalid session', 404);

    const cart = await this.repository.delete(data);
    if (!cart) throw new HttpError('invalid cart', 404);
    session.numberOfItems = session.numberOfItems >= cart?.quantity ? session.numberOfItems - cart?.quantity : 0;
    session.total = session.total >= cart.total ? session.total - cart.total : 0;
    session = await this._cartSession.update(session._id, session);
    return session;
    // return
  }

  deleteAll(userId: string) {
    return this._cartSession.delete({ userId });
  }

  async remove(productId: string, userId: string, sessionId: string) {
    let session = userId ? await this._cartSession.findOne({ userId }) : await this._cartSession.findOne({ sessionId });
    const product = await this._productService().findOne(productId);
    if (!product) throw new HttpError('invalid product', 404);
    if (!session) throw new HttpError('invalid session', 404);

    session.numberOfItems = session.numberOfItems > 0 ? session.numberOfItems - 1 : 0;
    session.total =
      session.total >= this._productService().discountedPrice(product)
        ? session.total - this._productService().discountedPrice(product)
        : 0;
    session = await this._cartSession.update(session._id, session);

    const cart = await this.findOne({ productId, sessionId: session!._id });
    if (!cart) throw new HttpError('invalid cart', 404);

    if (cart.quantity > 1) {
      await this.update(cart._id, {
        quantity: cart.quantity - 1,
        total: cart.total - this._productService().discountedPrice(product),
      });
    } else {
      await this.delete(cart._id);
    }
    return session;
  }

  async get(userId: string, sessionId: string) {
    const dbSession = await this.repository.RepositorySession();

    try {
      dbSession.startTransaction();

      let session;

      if (userId) {
        session = await this._cartSession.findOne({ userId });
      }

      if (!session) {
        session = await this._cartSession.findOne({ sessionId });
      }

      // if no cart session found with cookie sessionID, create new cart session
      if (!session) {
        session = (<DocType<CartSessionInterface>[]>(
          (<unknown>await this._cartSession.create([{ sessionId, userId, total: 0, numberOfItems: 0 }], dbSession))
        ))[0];
        // throw new HttpError('this cart is empty... add an item to begin', 404);
      }

      // if session doc exist without a userId and userId is not undefined
      // update session doc with userId
      if (!session.userId && userId) {
        session.userId = userId;
        this._cartSession.update(session._id, session, false, false, dbSession);
      }

      const data = await this.find(
        { sessionId: session!._id },
        {
          populate: {
            path: 'productId',
            model: 'Product',
            // select: 'name images brand isOutOfStock vendorId',
            populate: {
              path: 'vendor',
              model: 'Vendor',
              select: 'firstname lastname shopName',
            },
          },
        },
      );

      await dbSession.commitTransaction();
      return { ...session, items: data };
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      dbSession.endSession();
    }
  }

  get session() {
    return this._cartSession;
  }

  // checkout() {}

  async isStillInStock(cartId: string) {
    const cart = await this.findOne(cartId);
    if (!cart) throw new HttpError('invalid cart', 404);
    const product = await this._productService().findOne(cart.productId.toString());
    if (!product) throw new HttpError('invalid product', 404);

    return product?.quantity >= (product.sold || 0) + cart.quantity;
  }
  static instance() {
    if (!CartService._instance) {
      CartService._instance = new CartService();
    }
    return CartService._instance;
  }
}

export default CartService;
