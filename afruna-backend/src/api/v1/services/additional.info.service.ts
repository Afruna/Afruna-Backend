import { AdditionalInfoInterface } from '@interfaces/Additional.Info.Interface';
import AdditionalInfoRepository from '@repositories/AdditionalInfo.repo';
import Service from '@services/service';

class AdditionalInfoService extends Service<AdditionalInfoInterface, AdditionalInfoRepository> {
  private static _instance: AdditionalInfoService;
  protected repository = new AdditionalInfoRepository();

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId });
  }

  static instance() {
    if (!AdditionalInfoService._instance) {
      AdditionalInfoService._instance = new AdditionalInfoService();
    }
    return AdditionalInfoService._instance;
  }
}

export default AdditionalInfoService;
