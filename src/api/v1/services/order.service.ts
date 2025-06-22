import HttpError from '@helpers/HttpError';
import { DeliveryStatus, OrderInterface, OrderSessionInterface, PaymentMethod } from '@interfaces/Order.Interface';
import OrderRepository from '@repositories/Order.repo';
import OrderSessionRepository from '@repositories/OrderSession.repo';
import Service from '@services/service';
import UserService from './user.service';
import CartService from './cart.service';
import ProductService from './product.service';
import { AddressInterface } from '@interfaces/User.Interface';
import { generateOrderNumber } from '@utils/generateToken';
import AddressService from './address.service';
import TransactionService from './transaction.service';
import { PAYSTACK_REDIRECT } from '@config';
import { computeDeliveryFee, computeVAT } from '@utils/delivery.compute';
import NotificationService from './notification.service';
import shipbubbleAxios from '@utils/shipbubbleAxios';
import Address from '@models/Address';
import ShippingInfo from '@models/ShippingInfo';
import Vendor from '@models/Vendor';

export default class OrderService extends Service<OrderInterface, OrderRepository> {
  protected repository = new OrderRepository();
  protected _orderSession = new OrderSessionRepository();
  protected _userService = UserService.instance;
  protected _notificationService = NotificationService.instance;
  protected _cartService = CartService.instance;
  protected _addressService = AddressService.instance;
  protected _transactionService = TransactionService.instance;
  protected _productService = ProductService.instance;
  private static _instance: OrderService;
  private populateProduct = {
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

  async createOrder(userId: string, addressId: string, paymentMethod: PaymentMethod = PaymentMethod.CARD, request_token?: string, service_code?: string, courier_id?: string) {
    try {
      let user = await this._userService().findOne({ _id: userId });

      if (!user) throw new HttpError('User not found', 404);

      const cartSession = await this._cartService().session.findOne({ userId });


      if (!cartSession) throw new HttpError('invalid cart', 404);
      if (!cartSession.total || cartSession.total < 1) throw new HttpError('empty cart', 400);
      await this.validateOutOfStock(cartSession._id);

      const deliveryAddress = await this._addressService().findOne({ _id: addressId });

      if (!deliveryAddress) throw new HttpError('Invalid Address', 400);

      const orderNumber = generateOrderNumber(deliveryAddress.state);

      const orderSession = await this._orderSession.create({
        userId,
        total: cartSession.total,
        orderNumber,
        paymentMethod,
        deliveryFee: await computeDeliveryFee(),
        vat: await computeVAT(cartSession.total),
      });

      // if(request_token && service_code && courier_id){
        let createdShipment = await shipbubbleAxios.post('/shipping/create_shipment', {
          request_token,
          service_code,
          courier_id,
        });
      // }
      createdShipment = createdShipment.data.data;

      let orders: DocType<OrderInterface>[] = [];
      let order: any = {};

      for await (const cartItem of await this._cartService().find({ sessionId: cartSession._id.toString() })) {
        if (await this.findOne({ sessionId: orderSession._id })) {
          order = await this.update(
            { sessionId: orderSession._id },
            {
              load: {
                key: 'items',
                value: { productId: cartItem.productId, quantity: cartItem.quantity, amount: +cartItem.total },
              },
              increment: { key: 'total', value: +cartItem.total },
            },
          );
        } else {
          order = await this.create({
            userId,
            sb_order_id: createdShipment.order_id,
            tracking_url: createdShipment.tracking_url,
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
            paymentMethod,
          });

          orders.push(order);
        }

        console.log(orders);

        await this._cartService().delete(cartItem._id);
      }

      await this._orderSession
        .custom()
        .findByIdAndUpdate({ _id: orderSession._id }, { $addToSet: { orders: { $each: orders } } });

      await this._cartService().session.delete(cartSession._id);

      await this.update(
        { sessionId: orderSession._id },
        { vat: orderSession.vat, deliveryFee: orderSession.deliveryFee },
      );

      let payment = null;

      switch (paymentMethod) {
        case PaymentMethod.CARD:
          payment = await this._transactionService().initializePayment(
            <string>orderSession._id,
            order._id,
            userId,
            PAYSTACK_REDIRECT,
          );
          break;

        case PaymentMethod.WALLET:
          payment = await this._transactionService().walletHandler(
            userId,
            order._id,
            orderSession.total + orderSession.vat + orderSession.deliveryFee,
            { type: 'product', orderSessionRef: orderSession._id, orderId: order._id },
          );
          break;

        default:
          payment = { message: 'Payment Method Not implemeted' };
          break;
      }

      

      await this._notificationService().create({
        userId,
        subject: `Pending Order: ${orderNumber}`,
        message: `Dear customer, you have a Pending Order: ${orderNumber}`,
      });

      await this._notificationService().create({
        vendorId: order.vendorId,
        subject: `New Order: ${orderNumber}`,
        message: `Dear vendor, you have a New Order: ${orderNumber}`,
      });

      return { order, payment, paymentMethod };
    } catch (err) {
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
      },
    );
  }

  async getUserOrders(userId: string, startDate?: string, endDate?: string) {
    const query: any = { userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    return this.find(query, {
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
    });
  }

  async getVendorOrder(vendor: string, startDate?: string, endDate?: string) {
    const query: any = { vendor };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    return await this.find(query);
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
      },
    );
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

  async getAddressCode(addressId: string) {
    try {
      const address = await Address.findOne({ _id: addressId }).populate('userId');
      console.log(address);
      if (!address || !address.userId || typeof address.userId === 'string') {
        throw new HttpError('Invalid address or user not found', 400);
      }
      let verifiedAddress = await shipbubbleAxios.post('/shipping/address/validate', {
        name: address.userId.firstName + ' ' + address.userId.lastName,
        email: address.userId.email,
        phone: address.phoneNumber,
        address: `${address.address}, ${address.city}, ${address.state}, Nigeria`,
      });
      console.log(verifiedAddress.data.data.address_code);
      return verifiedAddress.data.data.address_code;
    } catch (error) {
      console.log(error);
      throw new HttpError('Failed to get address code', 400);
    }
  }

  async getVendorAddressCode(vendorId: string) {
    const vendorAddress = await ShippingInfo.findOne({ _id: vendorId }).populate('vendorId');
    // const vendor = await Vendor.findOne({_id: vendorId});
    try {
      if (!vendorAddress || !vendorAddress.vendorId || typeof vendorAddress.vendorId === 'string') {
        throw new HttpError('Invalid vendor address or vendor not found', 400);
      }
      let verifiedAddress = await shipbubbleAxios.post('/shipping/address/validate', {
        name: vendorAddress.vendorId.firstname + ' ' + vendorAddress.vendorId.lastname,
        email: vendorAddress.vendorId.emailAddress,
        phone: vendorAddress.vendorId.phoneNumber,
        address: `${vendorAddress.addressLine1}, ${vendorAddress.city}, ${vendorAddress.state}, Nigeria`,
      });
      console.log(verifiedAddress.data.data.address_code);
      return verifiedAddress.data.data.address_code;
    } catch (error) {
      console.log(error);
      throw new HttpError('Failed to get address code', 400);
    }
  }

  async getShippingRates(userId: string, addressId: string) {
    try{
      let cartSession = await this._cartService().session.findOne({userId});
      if(!cartSession) throw new HttpError('Cart not found', 404);

      let cartItems = await this._cartService().find({sessionId: cartSession._id});
      if(!cartItems || cartItems.length === 0) throw new HttpError('Cart items not found', 404);

      // Transform cart items into shipping format
      const shippingItems = await Promise.all(
        cartItems.map(async (cartItem) => {
          // Get product details
          const product = await this._productService().findOne(cartItem.productId.toString());
          if (!product) throw new HttpError(`Product not found for cart item`, 404);

          return {
            name: product.name,
            description: product.desc,
            unit_weight: product.weight.toString(),
            unit_amount: (product.price + product.price * 0.075).toString(),
            quantity: cartItem.quantity.toString()
          };
        })
      );

      // Calculate approximate package dimensions
      const packageDimensions = this.calculatePackageDimensions(cartItems, shippingItems);

      let data = {
        sender_address_code: 51378738,
        reciever_address_code: 66761979,
        pickup_date: new Date(Date.now() + (2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        package_items: shippingItems,
        package_dimension: packageDimensions,
        category_id: 20754594,
      }

      let rates = await shipbubbleAxios.post('/shipping/fetch_rates', data);

      return rates.data.data;
    }
    catch(err){
      console.log(err);
      throw new HttpError('Failed to get shipping rates', 400);
    }
  }

  private calculatePackageDimensions(cartItems: any[], shippingItems: any[]) {
    // Calculate total weight and number of items
    const totalWeight = shippingItems.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_weight) * parseInt(item.quantity));
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Base dimensions for a small package (in cm)
    const baseLength = 15;
    const baseWidth = 12;
    const baseHeight = 8;

    // Adjust dimensions based on weight and number of items
    let length = baseLength;
    let width = baseWidth;
    let height = baseHeight;

    // Weight-based adjustments
    if (totalWeight > 5) {
      // Heavy items - increase all dimensions
      length = Math.min(50, baseLength + (totalWeight - 5) * 2);
      width = Math.min(40, baseWidth + (totalWeight - 5) * 1.5);
      height = Math.min(30, baseHeight + (totalWeight - 5) * 1);
    }

    // Item count-based adjustments
    if (totalItems > 3) {
      // Multiple items - increase length and width
      length = Math.min(60, length + (totalItems - 3) * 3);
      width = Math.min(50, width + (totalItems - 3) * 2);
    }

    // Ensure minimum dimensions
    length = Math.max(12, Math.round(length));
    width = Math.max(10, Math.round(width));
    height = Math.max(8, Math.round(height));

    return {
      length,
      width,
      height
    };
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
