import { AddressInterface } from '@interfaces/Address.Interface';
import Address from '@models/Address';
import Repository from '@repositories/repository';

class AddressRepository extends Repository<AddressInterface> {
  protected model = Address;
}

export default AddressRepository;
