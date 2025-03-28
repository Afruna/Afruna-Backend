import { ServiceProfileInterface } from '@interfaces/Service.Profile.Interface';
import ServiceProfile from '@models/ServiceProfile';
import Repository from '@repositories/repository';

class ServiceProfileRepository extends Repository<ServiceProfileInterface> {
  protected model = ServiceProfile;
}

export default ServiceProfileRepository;
