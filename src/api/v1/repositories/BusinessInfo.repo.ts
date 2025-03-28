import { BusinessInfoInterface } from '@interfaces/Business.Info.Interface';
import BusinessInfo from '@models/BusinessInfo';
import Repository from '@repositories/repository';

class BusinessInfoRepository extends Repository<BusinessInfoInterface> {
  protected model = BusinessInfo;
}

export default BusinessInfoRepository;
