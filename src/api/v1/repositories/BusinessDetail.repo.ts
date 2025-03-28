import { BusinessDetailInterface } from '@interfaces/Business.Detail.Interface';
import BusinessDetail from '@models/BusinessDetail';
import Repository from '@repositories/repository';

class BusinessDetailRepository extends Repository<BusinessDetailInterface> {
  protected model = BusinessDetail;
}

export default BusinessDetailRepository;
