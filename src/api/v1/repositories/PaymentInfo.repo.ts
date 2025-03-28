import { PaymentInfoInterface } from '@interfaces/PaymentInfo.Interface';
import PaymentInfo from '@models/PaymentInfo';
import Repository from '@repositories/repository';

class PaymentInfoRepository extends Repository<PaymentInfoInterface> {
  protected model = PaymentInfo;
}

export default PaymentInfoRepository;
