import { LegalRepInterface } from '@interfaces/Legal.Rep.Interface';
import LegalRep from '@models/LegalRep';
import Repository from '@repositories/repository';

class LegalRepRepository extends Repository<LegalRepInterface> {
  protected model = LegalRep;
}

export default LegalRepRepository;
