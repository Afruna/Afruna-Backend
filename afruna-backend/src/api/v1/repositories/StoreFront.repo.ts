import { StoreFrontInterface } from '@interfaces/Store.Front.Interface';
import StoreFront from '@models/StoreFront';
import Repository from '@repositories/repository';

class StoreFrontRepository extends Repository<StoreFrontInterface> {
  protected model = StoreFront;
}

export default StoreFrontRepository;
