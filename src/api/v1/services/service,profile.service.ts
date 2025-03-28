import HttpError from '@helpers/HttpError';
import { ServiceProfileInterface } from '@interfaces/Service.Profile.Interface';
import ServiceProfileRepository from '@repositories/ServiceProfile.repo';
import Service from '@services/service';
import ReviewService from './review.service';
// import { logger } from '@utils/logger';
// import s3 from '@helpers/multer';
// import { OPTIONS } from '@config';

class ServiceProfileService extends Service<ServiceProfileInterface, ServiceProfileRepository> {
  protected repository = new ServiceProfileRepository();
  private static _instance: ServiceProfileService;

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId });
  }

  static instance() {
    if (!ServiceProfileService._instance) {
        ServiceProfileService._instance = new ServiceProfileService();
    }
    return ServiceProfileService._instance;
  }
}

export default ServiceProfileService;
