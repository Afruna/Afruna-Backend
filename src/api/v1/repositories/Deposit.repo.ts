import { DepositInterface } from '@interfaces/Deposit.Interface';
import Deposit from '@models/Deposit';
import Repository from '@repositories/repository';

class DepositRepository extends Repository<DepositInterface> {
  protected model = Deposit;
}

export default DepositRepository;
