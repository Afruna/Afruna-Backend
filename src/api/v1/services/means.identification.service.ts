import HttpError from '@helpers/HttpError';
import { MeansIdentificationInterface } from '@interfaces/Means.Identification.Interface';
import MeansIdentificationRepository from '@repositories/MeansIdentification.repo';
import Service from '@services/service';

class MeansIdentificationService extends Service<MeansIdentificationInterface, MeansIdentificationRepository> {
  private static _instance: MeansIdentificationService;
  protected repository = new MeansIdentificationRepository();

  async createMeansIdentification(vendorId: string, data: MeansIdentificationInterface) {
    return this.repository.create({ vendorId,  ...data });
  }

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId }, { populate: { path: "vendorId", model: "Vendor", select: "-password -_id"} });
  }

  static instance() {
    if (!MeansIdentificationService._instance) {
      MeansIdentificationService._instance = new MeansIdentificationService();
    }
    return MeansIdentificationService._instance;
  }
}

export default MeansIdentificationService;
