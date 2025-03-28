/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import { SearchHistoryInterface } from '@interfaces/Search.History.Interface';
import SearchHistoryService from '@services/search.history.service';
import ReturnAddressController from './return.address.controller';

class SearchHistoryController extends Controller<SearchHistoryInterface> {
  service = new SearchHistoryService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    this.service.create({ ...data, userId: req.user._id });
  });

  get = this.control((req: Request) => {
    return this.service.find({ userId: req.user._id });
  });

}

export default SearchHistoryController;
