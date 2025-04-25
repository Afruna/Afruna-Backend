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

    this.router.route('/orders').get(this.controller.getAllOrders);
    this.router.route('/orders/:orderId').get(this.controller.getOrderById);
    this.router.route('/orders/customer/:userId').get(this.controller.getOrdersByUserId);
    this.router.route('/orders/vendor/:vendorId').get(this.controller.getOrdersByVendorId); 
    this.router.route('/vendor/:vendorId/business-information').get(this.controller.getVendorBusinessInformation);
    this.router.route('/vendor/:vendorId/business-details').get(this.controller.getVendorBusinessDetails);
    this.router.route('/vendor/:vendorId/customer-care-information').get(this.controller.getVendorCustomerCareInformation);
    this.router.route('/vendor/:vendorId/address-information').get(this.controller.getVendorAddressInformation);
    this.router.route('/vendor/:vendorId/payment-information').get(this.controller.getVendorPaymentInformation);
    this.router.route('/vendor/:vendorId/additional-information').get(this.controller.getAdditionalInformation);
    this.router.route('/vendor/:vendorId/legal-information').get(this.controller.getProviderLegalInformation);
    this.router.route('/vendor/:vendorId/means-of-identification').get(this.controller.getProviderMeansOfIdentification);
    this.router.route('/vendor/:vendorId/store-front').get(this.controller.getStoreFront);

    this.router.route('/submitted-kyc').get(this.controller.getAllSubmittedKYC);
    this.router.route('/submitted-kyc/:vendorId').get(this.controller.getAllVendorKYCDetails);
    this.router.route('/submitted-kyc').put(this.controller.updateKYCStatus);

    this.router.route('/kyc-logs').get(this.controller.getAllKYCLogs);
    this.router.route('/kyc-logs/:vendorId').get(this.controller.getKYCLogs);
    this.router.route('/kyc-logs/:logId').get(this.controller.getKYCLogById);
    this.router.route('/kyc-logs').post(this.controller.createKYCLog);
    this.router.route('/kyc-logs/:logId').put(this.controller.updateKYCLog);
    this.router.route('/kyc-stats').get(this.controller.getKYCStats);
    this.router.route('/product-stats').get(this.controller.getProductStats);
    this.router.route('/order-stats').get(this.controller.getOrderStats);
    this.router.route('/customer-stats').get(this.controller.getCustomerStats);
    this.router.route('/vendor-stats').get(this.controller.getVendorStats);
    this.router.route('/service-provider-stats').get(this.controller.getServiceProviderStats);

    this.router.route('/admins').get(this.controller.getAllAdmins);
    this.router.route('/admins').post(this.controller.createAdmin);
    this.router.route('/admins/:adminId').put(this.controller.updateAdmin);
    this.router.route('/admins/:adminId').delete(this.controller.deleteAdmin);

    this.router.route('/providers').get(this.controller.getAllProviders);
    this.router.route('/vendors').get(this.controller.getVendors);
    this.router.route('/customers').get(this.controller.getCustomers);
    this.router.route('/providers/:userId').get(this.controller.getBookingsCustomer);
    this.router.route('/customers/:userId').get(this.controller.getCustomerById);
    this.router.route('/service/:serviceId').put(this.controller.updateServiceStatus);
    this.router.route('/transactions').get(this.controller.getAllTransactions);

    this.router.route('/special-offers').get(this.controller.getAllSpecialOffers);
    this.router.route('/special-offers/:id').get(this.controller.getSpecialOfferById);
    this.router.route('/special-offers').post(this.controller.createSpecialOffer);
    this.router.route('/special-offers/:id').put(this.controller.updateSpecialOffer);
    this.router.route('/special-offers/:id').delete(this.controller.deleteSpecialOffer);

    this.router.route('/transactions/metrics').get(this.controller.adminTransactionMetrics);
    this.router.route('/service/cards/dashboard').get(this.controller.adminDashboardServiceCards);
    this.router.route('/service/cards/analytics').get(this.controller.adminDashboardCards);
    this.router.route('/chart/bookingSummary').get(this.controller.bookingSummary);
    this.router.route('/chart/bookingStatistics').get(this.controller.bookingStatistics);
    this.router.route('/table/topService').get(this.controller.topService);
    this.router.route('/table/topProvider').get(this.controller.topProvider);

    this.router.route('/chart').get(this.controller.getMonthlyRevenueAndOrders);

    //for tags
    this.router.route('/tags').get(this.controller.getAllTags);
    this.router.route('/tags').post(this.controller.createTag);
    this.router.route('/tags/:tagId').put(this.controller.updateTag);
    this.router.route('/tags/:tagId').delete(this.controller.deleteTag);
    // this.router.route('/tags/:tagId').get(this.controller.getTagById);

    return this.router;
  }
}
