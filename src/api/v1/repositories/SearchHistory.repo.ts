import { SearchHistoryInterface } from '@interfaces/Search.History.Interface';
import SearchHistory from '@models/SearchHistory';
import Repository from '@repositories/repository';

class SearchHistoryRepository extends Repository<SearchHistoryInterface> {
  protected model = SearchHistory;
}

export default SearchHistoryRepository;
