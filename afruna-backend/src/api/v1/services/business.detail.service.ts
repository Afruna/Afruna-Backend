import HttpError from '@helpers/HttpError';
import { BusinessDetailInterface } from '@interfaces/Business.Detail.Interface';
import BusinessDetailRepository from '@repositories/BusinessDetail.repo';
import Service from '@services/service';

class BusinessDetailService extends Service<BusinessDetailInterface, BusinessDetailRepository> {
  private static _instance: BusinessDetailService;
  protected repository = new BusinessDetailRepository();

  async createBusinessDetail(vendorId: string, data: BusinessDetailInterface) {
    return this.repository.create({ vendorId,  ...data });
  }

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId }, { populate: { path: "vendorId", model: "Vendor", select: "-password -_id"} });
  }

  static instance() {
    if (!BusinessDetailService._instance) {
      BusinessDetailService._instance = new BusinessDetailService();
    }
    return BusinessDetailService._instance;
  }
}

export default BusinessDetailService;
