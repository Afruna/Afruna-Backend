import Service from '@services/service';
import { SearchHistoryInterface } from '@interfaces/Search.History.Interface';
import SearchHistoryRepository from '@repositories/SearchHistory.repo';

class SearchHistoryService extends Service<SearchHistoryInterface, SearchHistoryRepository> {
  protected repository = new SearchHistoryRepository();
  private static _instance: SearchHistoryService;

  static instance() {
    if (!SearchHistoryService._instance) {
        SearchHistoryService._instance = new SearchHistoryService();
    }
    return SearchHistoryService._instance;
  }

}

export default SearchHistoryService;
