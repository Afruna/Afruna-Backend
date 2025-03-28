import HttpError from '@helpers/HttpError';
import { LegalRepInterface } from '@interfaces/Legal.Rep.Interface';
import LegalRepRepository from '@repositories/LegalRep.repo';
import Service from '@services/service';

class LegalRepService extends Service<LegalRepInterface, LegalRepRepository> {
  private static _instance: LegalRepService;
  protected repository = new LegalRepRepository();

  async createLegalRep(vendorId: string, data: LegalRepInterface) {
    return this.repository.create({ vendorId,  ...data });
  }

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId }, { populate: { path: "vendorId", model: "Vendor", select: "-password -_id"} });
  }

  static instance() {
    if (!LegalRepService._instance) {
      LegalRepService._instance = new LegalRepService();
    }
    return LegalRepService._instance;
  }
}

export default LegalRepService;
