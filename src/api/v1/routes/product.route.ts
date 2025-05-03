/* eslint-disable import/no-unresolved */
import ProductController from '@controllers/product.controller';
import { productRequestDTO } from '@dtos/product.dto';
import Route from '@routes/route';
import { ProductInterface } from '@interfaces/Product.Interface';

class ProductRoute extends Route<ProductInterface> {
  controller = new ProductController('product');
  dto = productRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get( this.controller.get)
      .post(
        this.authorizeVendor(),
        //this.accessControl(['product'], 'create'),
        // this.fileProcessor.uploadField<ProductInterface>([
        //   { name: 'coverPhoto', maxCount: 1 },
        //   { name: 'images', maxCount: 10 },
        // ]),
        this.validator(this.dto.create),
        this.controller.create,
      );

    this.router.route('/setProductStatus').post(this.authorizeVendor(), this.validator(this.dto.status), this.controller.setProductStatus);
    this.router.route('/getByVendor').get(this.authorizeVendor(), this.controller.getByVendor);
    this.router.route('/search').get(this.controller.searchByName);
    this.router.route('/searchUser').get(this.authorize(), this.controller.searchByNameLoggedOn);
    this.router.route('/vendor').get(this.authorizeVendor(), this.controller.getMyVendorProducts);
    this.router.route('/similar-products/:productId').get(this.authorize(), this.controller.getSimilarProducts);
    this.router.route('/often-bought').get(this.authorize(), this.controller.getOftenBought);
    this.router.route('/report').get(this.authorize(), this.controller.report);
    this.router.route('/hype').get(this.controller.getHype);
    this.router.route('/trending').get(this.controller.getTrending);
    this.router.route('/limited-stock-deals').get(this.controller.limitedStockDeals);
    this.router.route('/frequent').get(this.controller.getFrequentlyBought);
    this.router.route('/recently-viewed').get(this.controller.getRecentlyViewed);
    this.router.route('/category/:categoryId').get(this.controller.getSubCategoryProducts);
    this.router.route('/:vendorId/vendor').get(this.controller.getVendorProducts);
    this.router.get('/cards', this.authorize(), this.controller.getVendorCards);
    this.router.get(
      '/table/:interval',
      this.authorize(),
      this.validator(this.dto.interval),
      this.controller.getVendorTable,
    );
    this.router
      .route('/:productId')
      .get(this.validator(this.dto.id), this.controller.getOne)
      .put(
        //attendto to this later
        // this.authorizeVendor(),
        //this.accessControl(['product'], 'update'),
        this.fileProcessor.uploadField<ProductInterface>([
          { name: 'coverPhoto', maxCount: 1 },
          { name: 'images', maxCount: 10 },
        ]),
        this.validator(this.dto.update.concat(this.dto.id)),
        this.controller.update,
      )
      .delete(this.authorizeVendor(), this.validator(this.dto.id), this.controller.delete);
    return this.router;
  }
}
export default ProductRoute;
