import { ProductInterface } from '@interfaces/Product.Interface';
import Product from '@models/Product';
import Repository from '@repositories/repository';

class ProductRepository extends Repository<ProductInterface> {
  protected model = Product;
}

export default ProductRepository;
