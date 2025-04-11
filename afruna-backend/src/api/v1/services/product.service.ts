import HttpError from '@helpers/HttpError';
import { ProductInterface, ProductStatus } from '@interfaces/Product.Interface';
import ProductRepository from '@repositories/Product.repo';
import Service from '@services/service';
import CategoryService from './category.service';
import AnalyticsService from './analytics.service';
import WishlistService from './wishlist.service';
import CartRepository from '@repositories/Cart.repo';
import CartSessionRepository from '@repositories/CartSession.repo';
import Product from "../models/Product"
import OrderRepository from '@repositories/Order.repo';
import MainCategoryService from './mainCategory.service';
import SearchHistoryRepository from '@repositories/SearchHistory.repo';

class ProductService extends Service<ProductInterface, ProductRepository> {
  protected repository = new ProductRepository();
  protected _categoryService = new CategoryService();
  protected _mainCategoryService = new MainCategoryService();
  protected _analyticsService = new AnalyticsService();
  protected _wishlistService = WishlistService.instance;
  private static _instance: ProductService;
  protected _cartRepository = new CartRepository();
  protected _cartSession = new CartSessionRepository()
  protected _orderRepository = new OrderRepository()
  protected _searchHistoryRepository = new SearchHistoryRepository()

  async setProductStatus(data: { productId: string, status: ProductStatus }){
    let product = await this.repository.findOne({_id: data.productId});

    if(!product)
      throw new HttpError("Invalid Product", 400);
    product = await this.repository.update({_id: data.productId}, { status: data.status });
    return product;
  }

  async getByVendor(vendor){
    let products = await this.repository.find({ vendor }, { populate : { path: "vendor", model: "Vendor", select: "-password"}}); 
    return products;
  }


  async boughtProducts(userId: string){
    let order = await this._orderRepository.find({vendorId: userId});
    let products = order.flatMap(item => item.items);
    return products
  }

  async limitedStockDeals(query: Record<string, any>){
    return this.paginatedFind(query, { name: 1 }, [
      {
        path: 'categoryId',
        model: 'Category'
      }
    ])
  }

  async updateProductsWhenInCart(products: any[], userId: string) {
    let session = await this._cartSession.findOne({ userId });
    if(!session){
      return products
    }
    const cart = await this._cartRepository.find(
      { sessionId: session!._id }
    );

    let updatedProducts = products.map((product) => {
      let inCart = cart.some((item) => item.productId == product._id);

      return {
        ...product,
        inCart
      };
    });

    return updatedProducts
  }

  async checkIfProductIsInCart(productId: string, userId: string) {
    let session = await this._cartSession.findOne({ userId });
    if(!session){
      return false
    }
    const cart = await this._cartRepository.find(
      { sessionId: session!._id }
    );
    
    let inCart = cart.some((item) => String(item.productId) == String(productId));
    return inCart
  }

  async getProductsBySubCategory(mainCategoryId: string) {
    return this.find({ mainCategoryId })
    //return this._categoryService.getAllProductsInNestedCategories(categoryId);
  }

  async getSimilarProductsToProduct(productId: string) {
    const product = await this.repository.findOne({ _id: productId });
    if (!product) throw new HttpError("Product Not Found", 404);

    return this._categoryService.getAllProductsInNestedCategories(product.categoryId as string);
  }

  async create(data: Partial<ProductInterface>) {
    const category = await this._categoryService.findOne(<string>data.categoryId);
    if (!category) throw new HttpError('invalid category', 404);
    if (data.options && data.options?.length >= 1) {
      const totalQuantity = data.options.reduce((total, val) => {
        return (total = total + +val.quantity);
      }, 0);
      if (Number(data.quantity) !== totalQuantity)
        throw new HttpError('total products in options must be equal to total quantity', 400);
    }
    return this.repository.create(data);
  }

  async createProduct(data: Partial<ProductInterface>) {
    const category = await this._categoryService.findOne(<string>data.categoryId);
    if (!category) throw new HttpError('invalid category', 404);
    // if (data.options && data.options?.length >= 1) {
    //   const totalQuantity = data.options.reduce((total, val) => {
    //     return (total = total + +val.quantity);
    //   }, 0);
    //   if (Number(data.quantity) !== totalQuantity)
    //     throw new HttpError('total products in options must be equal to total quantity', 400);
    // }
    return this.repository.create(data);
  }

  async update(query: string | Partial<ProductInterface>, data: UpdateData<ProductInterface>) {
    const product = await this.findOne(query);
    if (!product) throw new HttpError('invalid product', 404);

    if (data.deliveryLocations) {
      const deliveryLocation = product.deliveryLocations.find(
        (val) => val === <string>(<unknown>data.deliveryLocations),
      );
      if (deliveryLocation) {
        (<any>data).$pull = { deliveryLocations: deliveryLocation };
      } else {
        (<any>data).$push = { deliveryLocations: deliveryLocation };
      }
    }

    if (data.metaData) {
      const meta = product.metaData.find((val) => val === <string>(<unknown>data.metaData));
      if (meta) {
        (<any>data).$pull = { deliveryLocations: meta };
      } else {
        (<any>data).$push = { deliveryLocations: meta };
      }
    }

    if (product && data.sold && data.sold + product?.sold === product?.quantity) {
      // data.isOutOfStock = true;
    }

    if (product && data.sold && data.sold + product?.sold > product?.quantity) {
      throw new HttpError('cannot sell product that does not exits', 400);
    }

    // calculate total score
    data.totalScore = this.calculateTotalScore({
      saleCount: product.sold,
      rating: product.ratings,
      reviewCount: product.ratedBy,
      freshnessFactor: this.calculateFreshnessFactorExponential(<Date>product.updatedAt),
    });

    return this.repository.update(query, data);
  }

  vendorCards(userId: string) {
    return this._analyticsService.vendorCards(userId);
  }

  vendorTable(userId: string, interval: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    return this._analyticsService.revenueOrderTable(interval, userId);
  }

  report(userId: string) {
    return this._analyticsService.reportCards(userId);
  }

  frequent(
    query: Partial<ProductInterface & { page?: string | number | undefined; limit?: string | number | undefined }>,
  ) {
    return this.paginatedFind(query, { frequency: -1 }, [
      {
        path: 'categoryId',
        model: 'Category'
      },
    ]);
  }

  recentlyViewed() {
    return this.paginatedFind({}, { viewed: -1,  }, [
      {
        path: 'categoryId',
        model: 'Category'
      },
    ]);
  }

  discountedPrice(product: ProductInterface) {
    const total = product.discount ? product.price * ((100 - product.discount) / 100) : product.price;
    return +total.toFixed(2);
  }

  calculateFreshnessFactorExponential(updatedAt: Date, lambda: number | undefined = 0.05) {
    const currentTime: any = new Date();
    const ageInMilliseconds = currentTime - <any>new Date(updatedAt);
    const ageInDays = ageInMilliseconds / (1000 * 60 * 60 * 24);

    // Exponential decay formula
    const freshnessFactor = Math.exp(-lambda * ageInDays);
    return freshnessFactor;
  }

  calculateTotalScore(props: { saleCount: number; rating: number; reviewCount: number; freshnessFactor: number }) {
    return props.saleCount * 0.5 + props.rating * 0.3 + props.reviewCount * 0.1 + props.freshnessFactor * 0.1;
  }

  async paginatedFindWithWishlist(
    query:
      | Partial<
        ProductInterface & {
          _id: string;
          createdAt: string | object;
          updatedAt: string | object;
          cached?: boolean | undefined;
        } & { page?: string | number | undefined; limit?: string | number | undefined }
      >
      | { [x: string]: string }
      | undefined,
    userId: string,
  ) {
    const result = await this.paginatedFind(query, { totalScore: -1 }, [
      {
        path: 'categoryId',
        model: 'Category',
      },

      {
        path: 'vendorId',
        model: 'Vendor',
        select: 'firstName lastName',
      },
    ]);

    if (userId) {
      const wishlist = (await this._wishlistService().findOne({ userId }))?.productsId.map((v) => v.toString());
      if (wishlist) {
        for (const product of result.data) {
          if (wishlist.includes(product._id.toString())) product.inWishlist = true;
        }
      }
    }

    result.data = await this.updateProductsWhenInCart(result.data, userId);
    return result
  }

  findOne(query: string | Partial<ProductInterface>) {
    return this.repository.findOne(query, {
      multiPopulate: [
        {
          path: 'categoryId',
          model: 'Category',
        },

        {
          path: 'vendorId',
          model: 'Vendor',
          select: 'firstname lastname city country',
        },
      ],
    });
  }

  findByName(query: string) {
    const customQuery = '.*' + query + '.*';
    return this.repository.custom().find({ name: { $regex: customQuery, $options: "i" } }).populate({
      path: 'vendorId',
      select: '-password'
    });
  }

  async findByNameLoggedOn(query: string, userId: string) {

    this._searchHistoryRepository.create({ name: query, userId });

    const customQuery = '.*' + query + '.*';
    return this.repository.custom().find({ name: { $regex: customQuery, $options: "i" } }).populate({
      path: 'vendorId',
      select: '-password'
    });
  }

  static instance() {
    if (!ProductService._instance) {
      ProductService._instance = new ProductService();
    }
    return ProductService._instance;
  }
}

export default ProductService;
