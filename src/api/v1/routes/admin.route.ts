/* eslint-disable import/no-unresolved */
import { userRequestDTO } from '@dtos/user.dto';
import Route from '@routes/route';
import { UserInterface } from '@interfaces/User.Interface';
import AdminController from '@controllers/admin.controller';

export default class AdminRoute extends Route<UserInterface> {
  controller = new AdminController('user');
  dto = userRequestDTO;

  initRoutes() {
    this.router.route('/login').post(this.controller.login);
    this.router.route('/table/revenueOrder').get(this.controller.adminRevenueOrderTable);
    this.router.route('/cards/dashboard').get(this.controller.adminDashboardCards);
    this.router.route('/salesCategory').get(this.controller.salesByCategory);
    this.router.route('/userGrowth').get(this.controller.userGrowth);
    this.router.route('/topProduct').get(this.controller.topSellingProduct);
    this.router.route('/cards/vendor').get(this.controller.adminVendorCards);
    this.router.route('/cards/orders').get(this.controller.orderCards);
    this.router.route('/cards/users').get(this.controller.userCards);
    this.router.route('/block/:userId').put(this.controller.block);
    this.router.route('/hype/:productId').put(this.controller.hype);
    this.router.route('/block/:productId/product').put(this.controller.blockProduct);
    this.router.route('/block/:serviceId/service').put(this.controller.blockService);
    this.router.route('/reviews').get(this.controller.reviews);

    
    this.router.route('/providers').get(this.controller.getProvider);
    this.router.route('/vendors').get(this.controller.getVendors);
    this.router.route('/customers').get(this.controller.getCustomers);
    this.router.route('/providers/:userId').get(this.controller.getBookingsCustomer);
    this.router.route('/customers/:userId').get(this.controller.getCustomerById);
    this.router.route('/service/:serviceId').put(this.controller.updateServiceStatus);

    this.router.route('/service/cards/dashboard').get(this.controller.adminDashboardServiceCards);
    this.router.route('/chart/bookingSummary').get(this.controller.bookingSummary);
    this.router.route('/chart/bookingStatistics').get(this.controller.bookingStatistics);
    this.router.route('/table/topService').get(this.controller.topService);
    this.router.route('/table/topProvider').get(this.controller.topProvider);

    return this.router;
  }
}
