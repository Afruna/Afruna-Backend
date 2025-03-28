import { ShippingInfoInterface } from '@interfaces/Shipping.Info.Interface';
import ShippingInfoRepository from '@repositories/ShippingInfo.repo';
import Service from '@services/service';

class ShippingInfoService extends Service<ShippingInfoInterface, ShippingInfoRepository> {
  private static _instance: ShippingInfoService;
  protected repository = new ShippingInfoRepository();

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId });
  }

  static instance() {
    if (!ShippingInfoService._instance) {
      ShippingInfoService._instance = new ShippingInfoService();
    }
    return ShippingInfoService._instance;
  }
}

export default ShippingInfoService;
