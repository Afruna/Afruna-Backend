import { QuoteInterface } from '@interfaces/Quote.Interface';
import Quote from '@models/Quote';
import Repository from '@repositories/repository';

class QuoteRepository extends Repository<QuoteInterface> {
  protected model = Quote;
}

export default QuoteRepository;
