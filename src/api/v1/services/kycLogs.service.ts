import { KYClogsInterface } from "@interfaces/KYClogs.Interface";
import Service from "./service";
import KycLogsRepository from "@repositories/KycLogs.repo";

class KycLogsService extends Service<KYClogsInterface, KycLogsRepository> {
  private static _instance: KycLogsService;
  protected repository = new KycLogsRepository();

  static instance() {
    if (!KycLogsService._instance) {
        KycLogsService._instance = new KycLogsService();
    }
    return KycLogsService._instance;
  }

  
}

export default KycLogsService;
