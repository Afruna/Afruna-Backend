import { AdditionalInfoInterface } from '@interfaces/Additional.Info.Interface';
import AdditionalInfo from '@models/AdditionalInfo';
import Repository from '@repositories/repository';

class AdditionalInfoRepository extends Repository<AdditionalInfoInterface> {
  protected model = AdditionalInfo;
}

export default AdditionalInfoRepository;
