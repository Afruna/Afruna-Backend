import { KYClogsInterface } from "@interfaces/KYClogs.Interface";
import Service from "./service";
import KycLogsRepository from "@repositories/KycLogs.repo";
import { KYCStatus } from "@interfaces/Vendor.Interface";
import VendorService from "./vendor.service";
import Category, { CategoryInterface } from '@models/Category';

class Category2Service extends Service<Category, CategoryInterface> {
  private static _instance: Category2Service;
  protected repository = new KycLogsRepository();
  vendorService = VendorService.instance()

  static instance() {
    if (!KycLogsService._instance) {
        KycLogsService._instance = new KycLogsService();
    }
    return KycLogsService._instance;
  }

  async createKycLog(data: KYClogsInterface): Promise<KYClogsInterface> {
    let existingLog = await this.repository.findOne({ vendorId: data.vendorId });
    if (existingLog) {
      existingLog = await this.repository.update(existingLog._id, data);

      let status = existingLog.additionalInfoStatus && existingLog.storeFrontStatus && existingLog.paymentInfoStatus && existingLog.shippingInfoStatus && ((existingLog.businessDetailStatus && existingLog.businessInfoStatus && existingLog.customerCareStatus) || (existingLog.legalRepStatus && existingLog.meansIdentificationStatus)) ? KYCStatus.APPROVED : KYCStatus.PENDING;

      console.log("status", status)

      if(status === KYCStatus.APPROVED) {
        console.log("approved")
        let vendor = await this.vendorService.update(existingLog.vendorId, {kycStatus: KYCStatus.APPROVED});
        console.log("vendor", vendor)
      }

      existingLog = await this.repository.update(existingLog._id, {status});
      return existingLog
    }

    return this.repository.create(data);
  }
}

export default KycLogsService;
