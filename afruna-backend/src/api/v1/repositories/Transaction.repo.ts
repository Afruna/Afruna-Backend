import { TransactionInterface } from '@interfaces/Transaction.Interface';
import Transaction from '@models/Transaction';
import Repository from '@repositories/repository';

class TransactionRepository extends Repository<TransactionInterface> {
  protected model = Transaction;
}

export default TransactionRepository;
