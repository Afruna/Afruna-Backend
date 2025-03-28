import HttpError from '@helpers/HttpError';
import { DeliveryStatus, OrderInterface, OrderSessionInterface } from '@interfaces/Order.Interface';
import OrderRepository from '@repositories/Order.repo';
import OrderSessionRepository from '@repositories/OrderSession.repo';
import Service from '@services/service';
import UserService from './user.service';
import CartService from './cart.service';
import { AddressInterface } from '@interfaces/User.Interface';

export default class OrderSessionService extends Service<OrderSessionInterface, OrderSessionRepository> {
  protected repository = new OrderSessionRepository();
  private static _instance: OrderSessionService;
  private   populateProduct = {
    path: 'productId',
    model: 'Product',
    select: 'name images',
  };

  static instance() {
    if (!OrderSessionService._instance) {
      OrderSessionService._instance = new OrderSessionService();
    }
    return OrderSessionService._instance;
  }
}
