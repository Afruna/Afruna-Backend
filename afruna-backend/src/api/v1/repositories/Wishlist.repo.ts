import { WishlistInterface } from '@interfaces/Wishlist.Interface';
import Wishlist from '@models/Wishlist';
import Repository from '@repositories/repository';

class WishlistRepository extends Repository<WishlistInterface> {
  protected model = Wishlist;

  async findPopulatedOne(query: any,
      options?: Omit<OptionsParser<WishlistInterface>, 'sort' | 'limit' | 'skip'> | undefined,){
      return this.model.findOne(query, options).populate("productsId").exec();
  }
}

export default WishlistRepository;
