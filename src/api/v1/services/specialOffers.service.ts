import { StoreFrontInterface } from '@interfaces/Store.Front.Interface';
import SpecialOffersRepository from '@repositories/SpecialOffers.repo';
import { SpecialOffersInterface } from '@models/SpecialOffers';
import StoreFrontRepository from '@repositories/StoreFront.repo';
import Service from '@services/service';

class SpecialOffersService extends Service<SpecialOffersInterface, SpecialOffersRepository> {
  private static _instance: SpecialOffersService;
  protected repository = new SpecialOffersRepository();

  async getByProductId(productId: string) {
    return this.findOne({ product: productId });
  }

  static instance() {
    if (!SpecialOffersService._instance) {
      SpecialOffersService._instance = new SpecialOffersService();
    }
    return SpecialOffersService._instance;
  }
}

export default SpecialOffersService;
