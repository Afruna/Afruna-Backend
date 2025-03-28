import HttpError from '@helpers/HttpError';
import { CustomerCareDetailInterface } from '@interfaces/CustomerCare.Detail.Interface';
import CustomerCareDetailRepository from '@repositories/CustomerCareDetail.repo';
import Service from '@services/service';
import BusinessDetailService from './business.detail.service';

class CustomerCareDetailService extends Service<CustomerCareDetailInterface, CustomerCareDetailRepository> {
  private static _instance: CustomerCareDetailService;
  protected repository = new CustomerCareDetailRepository();

  async createCustomerCareInfo(vendorId: string, data: CustomerCareDetailInterface) {
    return this.repository.create({ vendorId,  ...data });
  }

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId }, { populate: { path: "vendorId", model: "Vendor", select: "-password -_id"} });
  }

  static instance() {
    if (!CustomerCareDetailService._instance) {
      CustomerCareDetailService._instance = new CustomerCareDetailService();
    }
    return CustomerCareDetailService._instance;
  }
}

export default CustomerCareDetailService;
