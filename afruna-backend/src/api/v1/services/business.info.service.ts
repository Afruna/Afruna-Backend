import HttpError from '@helpers/HttpError';
import { BusinessInfoInterface } from '@interfaces/Business.Info.Interface';
import BusinessInfoRepository from '@repositories/BusinessInfo.repo';
import Service from '@services/service';

class BusinessInfoService extends Service<BusinessInfoInterface, BusinessInfoRepository> {
  private static _instance: BusinessInfoService;
  protected repository = new BusinessInfoRepository();

  async createBusinessInfo(vendorId: string, data: BusinessInfoInterface) {
    return this.repository.create({ vendorId,  ...data });
  }

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId }, { populate: { path: "vendorId", model: "Vendor", select: "-password -_id"} });
  }

  static instance() {
    if (!BusinessInfoService._instance) {
      BusinessInfoService._instance = new BusinessInfoService();
    }
    return BusinessInfoService._instance;
  }
}

export default BusinessInfoService;
