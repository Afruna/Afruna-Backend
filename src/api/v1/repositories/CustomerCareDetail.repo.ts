import { CustomerCareDetailInterface } from '@interfaces/CustomerCare.Detail.Interface';
import CustomerCareDetail from '@models/CustomerCareDetail';
import Repository from '@repositories/repository';

class CustomerCareDetailRepository extends Repository<CustomerCareDetailInterface> {
  protected model = CustomerCareDetail;
}

export default CustomerCareDetailRepository;
