import { CardInterface } from '@interfaces/Card.Interface';
import Card from '@models/Card';
import Repository from '@repositories/repository';

class CardRepository extends Repository<CardInterface> {
  protected model = Card;
}

export default CardRepository;
