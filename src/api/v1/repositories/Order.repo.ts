import { OrderInterface } from '@interfaces/Order.Interface';
import Order from '@models/Order';
import Repository from '@repositories/repository';

class OrderRepository extends Repository<OrderInterface> {
  protected model = Order;
}

export default OrderRepository;
