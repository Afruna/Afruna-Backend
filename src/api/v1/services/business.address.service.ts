import { BusinessAddressInterface } from '@interfaces/Business.Address.Interface';
import BusinessAddressRepository from '@repositories/BusinessAddress.repo';
import Service from '@services/service';

class BusinessAddressService extends Service<BusinessAddressInterface, BusinessAddressRepository> {
  private static _instance: BusinessAddressService;
  protected repository = new BusinessAddressRepository();

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId });
  }

  static instance() {
    if (!BusinessAddressService._instance) {
      BusinessAddressService._instance = new BusinessAddressService();
    }
    return BusinessAddressService._instance;
  }
}

export default BusinessAddressService;
