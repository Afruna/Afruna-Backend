import { WalletInterface } from '@interfaces/Wallet.Interface';
import Wallet from '@models/Wallet';
import Repository from '@repositories/repository';

class WalletRepository extends Repository<WalletInterface> {
  protected model = Wallet;
}

export default WalletRepository;
