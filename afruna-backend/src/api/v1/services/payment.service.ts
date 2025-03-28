import HttpError from '@helpers/HttpError';
import { PaymentInterface } from '@interfaces/Payment.Interface';
import PaymentRepository from '@repositories/Payment.repo';
import Service from '@services/service';

class PaymentService extends Service<PaymentInterface, PaymentRepository> {
  private static _instance: PaymentService;
  protected repository = new PaymentRepository();

  async getAddressByUserId(userId: string) {
    return this.find({ userId });
  }

  static instance() {
    if (!PaymentService._instance) {
      PaymentService._instance = new PaymentService();
    }
    return PaymentService._instance;
  }
}

export default PaymentService;
