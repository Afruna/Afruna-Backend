import { ProvideInterface } from '@interfaces/Provide.Interface';
import Provide from '@models/Provide';
import Repository from '@repositories/repository';

class ProvideRepository extends Repository<ProvideInterface> {
  protected model = Provide;
}

export default ProvideRepository;
