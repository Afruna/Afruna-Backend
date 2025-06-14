import { PayoutInterface } from '@interfaces/Payout.Interface';
import Payout from '@models/Payouts';
import Repository from '@repositories/repository';

class PayoutRepository extends Repository<PayoutInterface> {
  protected model = Payout;
}

export default PayoutRepository; 