/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import ProductService from '@services/product.service';
import { ProductInterface, ProductStatus } from '@interfaces/Product.Interface';
import Controller from '@controllers/controller';
import { ProductResponseDTO } from '@dtos/product.dto';
import Product from '@models/Product';
// import { ProductResponseDTO } from '@dtos/product.dto';

class ProductController extends Controller<ProductInterface> {
  service = new ProductService();
  responseDTO = ProductResponseDTO.Product;

  create = this.control((req: Request) => {
    this.processFile(req, true);
    const data = req.body;
    data.status = data.status == ProductStatus.DRAFT ? ProductStatus.DRAFT : ProductStatus.PENDING;
    console.log(data)
    return this.service.createProduct({ ...data, vendor: req.vendor?._id.toString() });
  });

  setProductStatus = this.control((req: Request) => {
    const data = req.body;
    return this.service.setProductStatus(data);
  });

  getByVendor = this.control((req: Request) => {
    return this.service.getByVendor(req.vendor?._id.toString());
  });

  getOne = this.control((req: Request) => {
    this.service.update({_id: req.params.productId }, { viewed: new Date() })
    return this.service.findOne(
      { _id: req.params.productId }
    );
  });

  search = this.control(async (req: Request) => {
    const query = this.safeQuery(req);

    if (query.search) {
      Object.assign(query, this.parseSearchKey(<string>query.search, ['name']));
      delete query.search;
    }
    let userId = req.user?._id;
    return this.service.paginatedFindWithWishlist(query, userId);
  });

  searchByName = this.control(async (req: Request) => {
    const query = <string>req.query.name

    return this.service.findByName(query);
  });

  searchByNameLoggedOn = this.control(async (req: Request) => {
    const query = <string>req.query.name

    return await this.service.findByNameLoggedOn(query, req.user._id);
  });

  getHype = this.control(async (req: Request) => {
    // TODO:

    return this.service.find(
      { hype: true },
      {
        populate: {
          path: 'categoryId',
          model: 'Category',
          populate: {
            path: 'parent',
            model: 'Category',
          },
        },
      },
    );
  });

  getVendorProducts = this.control(async (req: Request) => {
    const params = req.params.vendorId;

    const result = await this.service.find(
      { vendor: params },
      {
        multiPopulate: [
          {
            path: 'categoryId',
            model: 'Category'
          },
          {
            path: 'vendor',
            model: 'Vendor',
            select: "-password"
          }
        ],
      },
    );
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });


  getMyVendorProducts = this.control(async (req: Request) => {
    const params = req.vendor?._id!;

    const result = await this.service.find(
      { vendor: params },
      {
        multiPopulate: [
          {
            path: 'categoryId',
            model: 'Category'
          },
          {
            path: 'vendor',
            model: 'Vendor',
            select: "-password"
          }
        ],
      },
    );
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getTrending = this.control(async (req: Request) => {
    // TODO:
    const result = await this.service.find(
      {},
      {
        populate: {
          path: 'categoryId',
          model: 'Category',
          populate: {
            path: 'parent',
            model: 'Category',
          },
        },
      },
    );
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getFrequentlyBought = this.control(async (req: Request) => {
    const query = this.safeQuery(req);
    const result = await this.service.frequent(query);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });


  getRecentlyViewed = this.control(async (req: Request) => {
    const query = this.safeQuery(req);
    const result = await this.service.recentlyViewed();
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });


  getSubCategoryProducts = this.control(async (req: Request) => {
    // const params = req.params[this.resourceId] || req.user?._id!;
    const result = await this.service.getProductsBySubCategory(req.params.categoryId);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  limitedStockDeals = this.control(async (req: Request) => {
    // const params = req.params[this.resourceId] || req.user?._id!;
    const result = await this.service.limitedStockDeals(<any>this.safeQuery(req));
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getSimilarProducts = this.control(async (req: Request) => {
    const result = await this.service.getSimilarProductsToProduct(req.params.productId);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getOftenBought = this.control(async (req: Request) => {
    const params = req.query.id || req.user?._id!;
    const result = await this.service.boughtProducts(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  get = this.control((req: Request) => {
    const query = this.safeQuery(req);

    if (query.search) {
      Object.assign(query, this.parseSearchKey(<string>query.search, ['name', 'desc']));
      delete query.search;
    }

    if (query['min-price'] || query['max-price']) {
      if (query.$and) {
        query.$and = [
          ...query.$and,
          ...this.parseRangeKeys(
            parseFloat(<string>query['min-price'] || '0'),
            parseFloat(<string>query['max-price'] || '999999999999999999999999999999999999999'),
            ['price'],
          )['$and'],
        ];
      } else {
        Object.assign(
          query,
          this.parseRangeKeys(
            parseFloat(<string>query['min-price'] || '0'),
            parseFloat(<string>query['max-price'] || '999999999999999999999999999999999999999'),
            ['price'],
          ),
        );
      }

      delete query['min-price'];
      delete query['max-price'];
    }

    let userId = req.user?._id;
    query.status = ProductStatus.ACTIVE;
    
    return this.service.paginatedFindWithWishlist(query, userId);
  });

  getAll = this.control(async (req: Request) => {
    let products = await Product.find();
    return products
  }
  );

  getVendorCards = this.control(async (req: Request) => {
    return this.service.vendorCards(req.user?._id);
  });

  getVendorTable = this.control(async (req: Request) => {
    return this.service.vendorTable(req.user?._id, <any>req.params.interval);
  });

  report = this.control(async (req: Request) => {
    return this.service.report(req.user?._id);
  });
}

export default ProductController;
