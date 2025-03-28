import { BusinessAddressInterface } from '@interfaces/Business.Address.Interface';
import BusinessAddress from '@models/BusinessAddress';
import Repository from '@repositories/repository';

class BusinessAddressRepository extends Repository<BusinessAddressInterface> {
  protected model = BusinessAddress;
}

export default BusinessAddressRepository;
