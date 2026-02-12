/* eslint-disable import/no-unresolved */
import VendorController from '@controllers/vendor.controller';
import { vendorRequestDTO } from '@dtos/vendor.dto';
import { VendorInterface } from '@interfaces/Vendor.Interface';
import Route from '@routes/route';

class VendorRoute extends Route<VendorInterface> {
  controller = new VendorController('vendor');
  dto = vendorRequestDTO;

  initRoutes() {

    this.router.get('/featured', this.controller.getFeatured);
    this.router.get('/popular-service-provider', this.controller.getPopularServiceProvider);

    this.router.get('/market-seller/stats', this.authorizeVendor(), this.controller.getMarketSellerDashboardStats);

    this.router.get('/service-provider/stats', this.authorizeVendor(), this.controller.getServiceProviderDashboardStats);

    this.router.get('/chart', this.authorizeVendor(), this.controller.getDashboardChart);
    
    this.router.get('/', this.controller.get);

    this.router.get('/profile', this.authorizeVendor(), this.controller.getProfile);
    this.router.get('/profile/:vendorId', this.controller.getProfileByVendorId);

    this.router.get('/market-seller', this.controller.getVendors);
    this.router.get('/service-provider', this.controller.getServiceProvider);

    this.router
      .route('/:vendorId')
      .get(this.validator(this.dto.id), this.controller.getOne)
      .patch(
        // this.authorize(),
        // this.accessControl(['product'], 'update'),
        // this.fileProcessor.uploadField<ProductInterface>([
        //   { name: 'coverPhoto', maxCount: 1 },
        //   { name: 'images', maxCount: 10 },
        // ]),
        this.validator(this.dto.update.concat(this.dto.id)),
        this.controller.update,
      )
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

      this.router.route('/following').get(this.controller.getFollowing);
      this.router.route('/follow').put(this.validator(this.dto.vendorId), this.controller.toggleFollow);
      // this.router.route('/transactions/:vendorId').get(this.authorizeVendor(), this.controller.getVendorTransactions);
      this.router.route('/transactions/history').get(this.authorizeVendor(), this.controller.getVendorTransactionHistory);

    return this.router;
  }
}
export default VendorRoute;
