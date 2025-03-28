import { ReturnAddressInterface } from '@interfaces/Return.Address.Interface';
import ReturnAddressRepository from '@repositories/ReturnAddress.repo';
import Service from '@services/service';

class ReturnAddressService extends Service<ReturnAddressInterface, ReturnAddressRepository> {
  private static _instance: ReturnAddressService;
  protected repository = new ReturnAddressRepository();

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId });
  }

  static instance() {
    if (!ReturnAddressService._instance) {
      ReturnAddressService._instance = new ReturnAddressService();
    }
    return ReturnAddressService._instance;
  }
}

export default ReturnAddressService;
