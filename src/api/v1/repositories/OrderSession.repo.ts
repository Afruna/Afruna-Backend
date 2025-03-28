import { OrderSessionInterface } from '@interfaces/Order.Interface';
import OrderSession from '@models/OrderSession';
import Repository from '@repositories/repository';

class OrderSessionRepository extends Repository<OrderSessionInterface> {
  protected model = OrderSession;
}

export default OrderSessionRepository;
