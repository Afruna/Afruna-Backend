import { KYClogsInterface } from "@interfaces/KYClogs.Interface";
import Service from "./service";
import KycLogsRepository from "@repositories/KycLogs.repo";
import { KYCStatus } from "@interfaces/Vendor.Interface";
import VendorService from "./vendor.service";
import OnlineStatus, { OnlineStatusInterface } from "@models/OnlineStatus";
import OnlineStatusRepo from "@repositories/OnlineStatus.repo";

class OnlineStatusService extends Service<OnlineStatusInterface, OnlineStatusRepo> {
  private static _instance: OnlineStatusService;
  protected repository = new OnlineStatusRepo();
  // vendorService = VendorService.instance()

  static instance() {
    if (!OnlineStatusService._instance) {
        OnlineStatusService._instance = new OnlineStatusService();
    }
    return OnlineStatusService._instance;
  }

  async createOnlineStatus(data: OnlineStatusInterface): Promise<OnlineStatusInterface> {
    let existingData = await this.repository.findOne({ id: data.id });
    data.lastSeen = new Date()

    if (existingData) {
      existingData = await this.repository.update(existingData._id, data);

      return existingData
    }

    return this.repository.create(data);
  }
}

export default OnlineStatusService;
