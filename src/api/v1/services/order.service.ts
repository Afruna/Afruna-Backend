import HttpError from '@helpers/HttpError';
import { DeliveryStatus, OrderInterface, OrderSessionInterface, PaymentMethod } from '@interfaces/Order.Interface';
import OrderRepository from '@repositories/Order.repo';
import OrderSessionRepository from '@repositories/OrderSession.repo';
import Service from '@services/service';
import UserService from './user.service';
import CartService from './cart.service';
import { AddressInterface } from '@interfaces/User.Interface';
import { generateOrderNumber } from '@utils/generateToken';
import AddressService from './address.service';
import TransactionService from './transaction.service';
import { PAYSTACK_REDIRECT } from '@config';
import { computeDeliveryFee, computeVAT } from '@utils/delivery.compute';
import NotificationService from './notification.service';

export default class OrderService extends Service<OrderInterface, OrderRepository> {
  protected repository = new OrderRepository();
  protected _orderSession = new OrderSessionRepository();
  protected _userService = UserService.instance;
  protected _notificationService = NotificationService.instance;
  protected _cartService = CartService.instance;
  protected _addressService = AddressService.instance;
  protected _transactionService = TransactionService.instance;
  private static _instance: OrderService;
  private   populateProduct = {
    path: 'productId',
    model: 'Product',
    select: 'name images',
  };

  get addAddress() {
    return this._userService().addAddress;
  }

  get getAddress() {
    return this._userService().getAddress;
  }

  get getAllAddresses() {
    return this._userService().getAllAddresses;
  }

  async createOrder(userId: string, addressId: string, paymentMethod: PaymentMethod = PaymentMethod.CARD ) {
    
    try
    {
      let user = await this._userService().findOne({ _id: userId });

      if(!user) throw new HttpError('User not found', 404)

      

      const cartSession = await this._cartService().session.findOne({ userId });

      if (!cartSession) throw new HttpError('invalid cart', 404);
      if (!cartSession.total || cartSession.total < 1) throw new HttpError('empty cart', 400);
      await this.validateOutOfStock(cartSession._id);

      const deliveryAddress = this._addressService().findOne({_id: addressId});

      if(!deliveryAddress)
        throw new HttpError('Invalid Address', 400);

      const orderNumber = generateOrderNumber(deliveryAddress.state);

      const orderSession = await this._orderSession.create({
        userId,
        total: cartSession.total,
        orderNumber,
        paymentMethod,
        deliveryFee: await computeDeliveryFee(),
        vat: await computeVAT(cartSession.total)
      });

      let orders: DocType<OrderInterface>[] = [];
      let order: any = {};

      for await (const cartItem of await this._cartService().find({ sessionId: cartSession._id.toString() })) {
        



        if (await this.findOne({ sessionId: orderSession._id })) {
          order = await this.update(
            { sessionId: orderSession._id },
            {
              load: { key: 'items', value: { productId: cartItem.productId, quantity: cartItem.quantity, amount: +cartItem.total } },
              increment: { key: 'total', value: +cartItem.total },
            },
          );
        } else {
          order = await this.create({
            userId,
            vendorId: cartItem.vendorId,
            vendor: cartItem.vendor,
            items: [{ productId: cartItem.productId, quantity: cartItem.quantity, amount: +cartItem.total }],
            options: cartItem.options,
            isPaid: false,
            total: cartItem.total,
            sessionId: orderSession._id,
            orderNumber,
            addressId,
            deliveryStatus: DeliveryStatus.PENDING,
            deliveryFee: await computeDeliveryFee(),
            paymentMethod
          });

          orders.push(order);
        }

        console.log(orders)

        await this._cartService().delete(cartItem._id);
      }

      await this._orderSession.custom().findByIdAndUpdate(
        { _id: orderSession._id },
        { $addToSet: { orders: { $each: orders } }})

      await this._cartService().session.delete(cartSession._id);

      await this.update({ sessionId: orderSession._id }, { vat: orderSession.vat, deliveryFee: orderSession.deliveryFee})
      
      let payment = null;

        switch(paymentMethod)
        {
          case PaymentMethod.CARD:
            payment = await this._transactionService().initializePayment(<string>orderSession._id, order._id, userId, PAYSTACK_REDIRECT);
          break;

          case PaymentMethod.WALLET:
            payment = await this._transactionService().walletHandler(userId, order._id, (orderSession.total + orderSession.vat + orderSession.deliveryFee), { type: "product", orderSessionRef: orderSession._id, orderId: order._id });
          break;

          default:
            payment = { message: "Payment Method Not implemeted" }
          break;
        }

      await this._notificationService().create({ userId, subject: `Pending Order: ${orderNumber}`,  message: `Dear customer, you have a Pending Order: ${orderNumber}`, });

      await this._notificationService().create({ vendorId: order.vendorId, subject: `New Order: ${orderNumber}`,  message: `Dear vendor, you have a New Order: ${orderNumber}`, });

      return { order, payment, paymentMethod };

    }
    catch(err)
    {
      //console.log(err);
      throw new HttpError(err.message, 400);
    }
    
  }

  // async createPackageOrder(userId: string, addressId: string, paymentMethod: PaymentMethod = PaymentMethod.CARD) {
  //   const cartSession = await this._cartService().session.findOne({ userId });

  //   if (!cartSession) throw new HttpError('invalid cart', 404);
  //   if (!cartSession.total || cartSession.total < 1) throw new HttpError('empty cart', 400);
  //   await this.validateOutOfStock(cartSession._id);

  //   const deliveryAddress = this._addressService().findOne({_id: addressId});

  //   if(!deliveryAddress)
  //     throw new HttpError('Invalid Address', 400);

  //   const orderNumber = generateOrderNumber();

  //   const orderSession = await this._orderSession.create({
  //     userId,
  //     addressId,
  //     total: cartSession.total,
  //     orderNumber
  //   });

  //   let orders: DocType<OrderInterface>[] = [];

  //   for await (const cartItem of await this._cartService().find({ sessionId: cartSession._id.toString() })) {
  //     let order: any = {};

  //     if (await this.findOne({ sessionId: orderSession._id })) {
  //       order = await this.update(
  //         { sessionId: orderSession._id },
  //         {
  //           load: { key: 'items', value: { productId: cartItem.productId, quantity: cartItem.quantity } },
  //           increment: { key: 'total', value: +cartItem.total },
  //         },
  //       );
  //     } else {
  //       order = await this.create({
  //         userId,
  //         vendorId: cartItem.vendorId,
  //         vendor: cartItem.vendor,
  //         items: [{ productId: cartItem.productId, quantity: cartItem.quantity }],
  //         options: cartItem.options,
  //         isPaid: false,
  //         total: cartItem.total,
  //         sessionId: orderSession._id,
  //         deliveryStatus: DeliveryStatus.PENDING,
  //         orderNumber,
  //         paymentMethod
  //       });

  //       orders.push(order);
  //     }

  //     console.log(orders)

  //     await this._cartService().delete(cartItem._id);
  //   }

  //   await this._orderSession.custom().findByIdAndUpdate(
  //     { _id: orderSession._id },
  //     { $addToSet: { orders: { $each: orders } }})

  //   await this._cartService().session.delete(cartSession._id);
  //   const payment = await this._transactionService().initializePayment(orderSession._id, userId);
  //   return { orderSession, payment };
  // }


  async validateOutOfStock(cartSessionId: string) {
    for await (const cartItem of await this._cartService().find({ sessionId: cartSessionId })) {
      const isStillInStock = await this._cartService().isStillInStock(cartItem._id);
      if (!isStillInStock)
        throw new HttpError('one or more products are out of stock, check your cart and try again', 400);
    }
    return true;
  }

  getOneOrderSession(query: { _id: string; userId?: string }) {
    return this._orderSession.findOne(query);
  }

  getUserOrder(userId: string) {
    return this._orderSession.find(
      { userId },
      {
        sort: { createdAt: -1 },
        multiPopulate: [
          {
            path: 'userId',
            model: 'User',
            select: 'firstName lastName avatar',
          },
          {
            path: 'orders',
            model: 'Order',
          },
        ],
      },);
  }

  getUserOrders(userId: string) {
    return this.find(
      { userId },
      {
        sort: { createdAt: -1 },
        multiPopulate: [
          {
            path: 'userId',
            model: 'User',
            select: 'firstName lastName avatar',
          },
          {
            path: 'addressId',
            model: 'Address',
          },
          {
            path: 'items.productId',
            model: 'Product',
          },
        ],
      },);
  }

  async getVendorOrder(vendor: string) {
    return await this.find(
      { vendor });
  }

  trackOrder(orderNumber: string) {
    return this.findOne(
      { orderNumber },
      {
        multiPopulate: [
          {
            path: 'userId',
            model: 'User',
            select: 'firstName lastName avatar',
          },
          {
            path: 'addressId',
            model: 'Address',
          },
          {
            path: 'items.productId',
            model: 'Product',
            select: 'name images',
          },
        ],
      },);
  }

  getAdminOrder() {
    return this.find(
      {},
      {
        populate: {
          path: 'userId',
          model: 'User',
          select: 'firstName lastName avatar',
        },
      },
    );
  }

  // getVendorOrder(vendorId: string) {
  //   return this.find(
  //     { vendorId },
  //     {
  //       populate: this.populateProduct,
  //     },
  //   );
  // }

  getOrderWithSessionId(query: { sessionId: string; vendorId?: string }) {
    return this.find(query, {
      populate: this.populateProduct,
    });
  }

  get session() {
    return this._orderSession;
  }

  static instance() {
    if (!OrderService._instance) {
      OrderService._instance = new OrderService();
    }
    return OrderService._instance;
  }
}
