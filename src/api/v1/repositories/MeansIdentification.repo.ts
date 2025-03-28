import { MeansIdentificationInterface } from '@interfaces/Means.Identification.Interface';
import MeansIdentification from '@models/MeansIdentification';
import Repository from '@repositories/repository';

class MeansIdentificationRepository extends Repository<MeansIdentificationInterface> {
  protected model = MeansIdentification;
}

export default MeansIdentificationRepository;
