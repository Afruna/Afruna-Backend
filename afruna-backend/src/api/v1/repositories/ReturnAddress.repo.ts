import { ReturnAddressInterface } from '@interfaces/Return.Address.Interface';
import ReturnAddress from '@models/ReturnAddress';
import Repository from '@repositories/repository';

class ReturnAddressRepository extends Repository<ReturnAddressInterface> {
  protected model = ReturnAddress;
}

export default ReturnAddressRepository;
