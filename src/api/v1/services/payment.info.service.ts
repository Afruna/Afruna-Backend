import { PaymentInfoInterface } from '@interfaces/PaymentInfo.Interface';
import PaymentInfoRepository from '@repositories/PaymentInfo.repo';
import Service from '@services/service';

class PaymentInfoService extends Service<PaymentInfoInterface, PaymentInfoRepository> {
  private static _instance: PaymentInfoService;
  protected repository = new PaymentInfoRepository();

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId });
  }

  static instance() {
    if (!PaymentInfoService._instance) {
      PaymentInfoService._instance = new PaymentInfoService();
    }
    return PaymentInfoService._instance;
  }
}

export default PaymentInfoService;
