import { StoreFrontInterface } from '@interfaces/Store.Front.Interface';
import SpecialOffersRepository from '@repositories/SpecialOffers.repo';
import { SpecialOffersInterface } from '@models/SpecialOffers';
import StoreFrontRepository from '@repositories/StoreFront.repo';
import Service from '@services/service';
import { DocType, OptionsParser } from '@interfaces/Mongoose';

class SpecialOffersService extends Service<SpecialOffersInterface, SpecialOffersRepository> {
  private static _instance: SpecialOffersService;
  protected repository = new SpecialOffersRepository();

  async getByProductId(productId: string) {
    return this.findOne({ product: productId });
  }

  find(
    query?:
      | Partial<
          DocType<SpecialOffersInterface> & {
            page?: string | number | undefined;
            limit?: string | number | undefined;
          }
        >
      | undefined,
    options?: OptionsParser<SpecialOffersInterface>,
  ): Promise<DocType<SpecialOffersInterface>[]> {
    return this.repository.find(query, {
      ...options,
      multiPopulate: [
        {
          path: 'product',
          model: 'Product',
          select: 'name price images'
        },
        {
          path: 'tag',
          model: 'Tags',
          select: 'name'
        }
      ],
    });
  }

  findOne(
    query: string | Partial<SpecialOffersInterface>,
    options?: Omit<OptionsParser<SpecialOffersInterface>, 'sort' | 'limit' | 'skip'> | undefined,
  ) {
    return this.repository.findOne(query, {
      ...options,
      multiPopulate: [
        {
          path: 'product',
          model: 'Product',
          select: 'name price images'
        },
        {
          path: 'tag',
          model: 'Tags',
          select: 'name'
        }
      ],
    });
  }

  async getStats() {
    const totalOffers = await this.repository.count({});
    const activeOffers = await this.repository.count({ status: true });
    const inactiveOffers = await this.repository.count({ status: false });
    
    // Get offers expiring soon (within next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringSoon = await this.repository.count({
      endDate: { $lte: sevenDaysFromNow, $gte: new Date() } as any,
      status: true
    });

    return {
      totalOffers,
      activeOffers,
      inactiveOffers,
      expiringSoon,
      activePercentage: totalOffers > 0 ? (activeOffers / totalOffers) * 100 : 0
    };
  }

  static instance() {
    if (!SpecialOffersService._instance) {
      SpecialOffersService._instance = new SpecialOffersService();
    }
    return SpecialOffersService._instance;
  }
}

export default SpecialOffersService;
