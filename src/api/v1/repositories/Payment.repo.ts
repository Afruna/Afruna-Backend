import { PaymentInterface } from '@interfaces/Payment.Interface';
import Payment from '@models/Payment';
import Repository from '@repositories/repository';

class PaymentRepository extends Repository<PaymentInterface> {
  protected model = Payment;
}

export default PaymentRepository;
