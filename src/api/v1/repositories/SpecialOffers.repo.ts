import Repository from '@repositories/repository';
import SpecialOffers, { SpecialOffersInterface } from '@models/SpecialOffers';


class SpecialOffersRepository extends Repository<SpecialOffersInterface> {
  protected model = SpecialOffers;
}

export default SpecialOffersRepository;
