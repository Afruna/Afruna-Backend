/* eslint-disable import/no-unresolved */
import SearchHistoryController from '@controllers/search.history.controller';
import { searchHistoryRequestDTO } from '@dtos/search.history.dto';
import { SearchHistoryInterface } from '@interfaces/Search.History.Interface';
import Route from '@routes/route';

export default class SearchHistoryRoute extends Route<SearchHistoryInterface> {
  controller = new SearchHistoryController('searchHistory');
  dto = searchHistoryRequestDTO;
  initRoutes() {
    this.router.post('/', this.authorize(), this.validator(this.dto.create), this.controller.create);
    this.router.get('/', this.authorize(), this.controller.get);

    return this.router;
  }
}