import UserService from '@services/user.service';
import AnalyticsService from '@services/analytics.service';
import ProductService from './product.service';
import OrderService from './order.service';
import ReviewService from './review.service';
import ProvideService from './provide.service';
import VendorService from "./vendor.service";
import BookingService from './booking.service';
import { ServiceStatusEnum } from '@interfaces/Provide.Interface';
import Admin, { IAdmin } from '@models/Admin';
import { sign } from 'jsonwebtoken';
import HttpError from '@helpers/HttpError';
import * as Config from '@config';
import jwt from 'jsonwebtoken';
import Provide from '@models/Provide';
import Order from '@models/Order';
import BusinessInfo from '@models/BusinessInfo';
import ShippingInfo from '@models/ShippingInfo';
import PaymentInfo from '@models/PaymentInfo';
import AdditionalInfo from '@models/AdditionalInfo';
import LegalRep from '@models/LegalRep';
import BusinessDetail from '@models/BusinessDetail';
import CustomerCareDetail from '@models/CustomerCareDetail';
import MeansIdentification from '@models/MeansIdentification';
import StoreFront from '@models/StoreFront';
import KYClogs from '@models/KYClogs';
import { KYClogsInterface } from '@interfaces/KYClogs.Interface';
import { KYCStatus, VendorStatus, VendorType } from '@interfaces/Vendor.Interface';
import Transaction from '@models/Transaction';
import SpecialOffersService from './specialOffers.service';
import { SpecialOffersInterface } from '@models/SpecialOffers';
import SpecialOffers from '@models/SpecialOffers';
import Product from '@models/Product';
import { DeliveryStatus, OrderStatus } from '@interfaces/Order.Interface';
import User from '@models/User';
import Vendor from '@models/Vendor';
import Booking from '@models/Booking';

class AdminService extends UserService {
  private _analytics = new AnalyticsService();
  private _userService = UserService.instance;
  private _reviewService = ReviewService.instance;
  private _productService = ProductService.instance;
  private __provideService = ProvideService.instance;
  private _bookingService = BookingService.instance;
  private _vendorService = VendorService.instance;
  private _orderService = OrderService.instance;
  private _specialOffersService = SpecialOffersService.instance;

  async getProductStats() {
    const products = await Product.find();
    
    const stats = {
      totalProducts: 0,
      inStock: 0, 
      lowStock: 0,
      outOfStock: 0
    };

    stats.totalProducts = products.length;

    products.forEach(product => {
      if (product.quantity === 0) {
        stats.outOfStock++;
      } else if (product.quantity <= 10) { // Assuming low stock threshold is 10
        stats.lowStock++;
      } else {
        stats.inStock++;
      }
    });

    return stats;
  }
  async getOrderStats() {
    const orders = await Order.find();
    
    const stats = {
      totalOrders: 0,
      allTimeOrders: 0,
      pendingOrders: 0,
      paidOrders: 0,
      cancelledOrders: 0,
      returnedOrders: 0,
      allTimeFulfilledOrders: 0
    };

    stats.totalOrders = orders.length;
    stats.allTimeOrders = orders.length;

    orders.forEach(order => {
      switch(order.orderStatus) {
        case OrderStatus.CANCELLED:
          stats.cancelledOrders++;
          break;
        case OrderStatus.PAID:
          stats.paidOrders++;
          stats.allTimeFulfilledOrders++;
          break;
        case OrderStatus.PENDING:
          stats.pendingOrders++;
          break;
        case OrderStatus.RETURNED:
          stats.returnedOrders++;
          break;
      }
    });

    return stats;
  }

  // async getOrderStats() {
  //   const orders = await Order.find();
    
  //   const stats = {
  //     totalOrders: 0,
  //     allTimeOrders: 0,
  //     returnedOrders: 0,
  //     pendingOrders: 0,
  //     shippedOrders: 0,
  //     deliveredOrders: 0,
  //     canceledOrders: 0,
  //     allTimeFulfilledOrders: 0
  //   };

  //   stats.totalOrders = orders.length;
  //   stats.allTimeOrders = orders.length;

  //   orders.forEach(order => {
  //     switch(order.deliveryStatus) {
  //       case DeliveryStatus.CANCELED:
  //         stats.canceledOrders++;
  //         break;
  //       case DeliveryStatus.DELIVERED:
  //         stats.deliveredOrders++;
  //         stats.allTimeFulfilledOrders++;
  //         break;
  //       case DeliveryStatus.PENDING:
  //         stats.pendingOrders++;
  //         break;
  //       case DeliveryStatus.SHIPPED:
  //         stats.shippedOrders++;
  //         break;
  //       case DeliveryStatus.RETURNED:
  //         stats.returnedOrders++;
  //         break;
  //     }
  //   });

  //   return stats;
  // }

  async getCustomerStats() {
    const users = await User.find();
    const orders = await Order.find().populate('userId');

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalCustomers: 0,
      newCustomersThisMonth: 0,
      returningCustomers: 0,
      activeCustomersLast30Days: 0,
      averageOrdersPerCustomer: 0
    };

    // Total customers
    stats.totalCustomers = users.length;

    // New customers this month
    stats.newCustomersThisMonth = users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= firstDayOfMonth;
    }).length;

    // Get unique customer IDs who have made orders
    const customerOrders = new Map();
    orders.forEach(order => {
      const userId = order.userId ? order.userId.toString() : '';
      if (!customerOrders.has(userId)) {
        customerOrders.set(userId, []);
      }
      customerOrders.get(userId).push(order);
    });

    // Returning customers (made more than 1 order)
    stats.returningCustomers = Array.from(customerOrders.values())
      .filter(customerOrderList => customerOrderList.length > 1).length;

    // Active customers in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    stats.activeCustomersLast30Days = Array.from(customerOrders.values())
      .filter(customerOrderList => 
        customerOrderList.some(order => new Date(order.createdAt) >= thirtyDaysAgo)
      ).length;

    // Average orders per customer
    stats.averageOrdersPerCustomer = customerOrders.size > 0 ? 
      (orders.length / customerOrders.size).toFixed(2) : 0;

    return stats;
  }

  async getVendorStats() {
    const vendors = await Vendor.find({ vendorType: VendorType.MARKET_SELLER });
    const orders = await Order.find();

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalVendors: 0,
      newVendorsThisMonth: 0,
      returningVendors: 0,
      activeVendorsLast30Days: 0
    };

    // Total vendors
    stats.totalVendors = vendors.length;

    // New vendors this month
    stats.newVendorsThisMonth = vendors.filter(vendor => {
      const createdAt = new Date(vendor.createdAt);
      return createdAt >= firstDayOfMonth;
    }).length;

    // Get unique vendor IDs who have received orders
    const vendorOrders = new Map();
    orders.forEach(order => {
      const vendorId = order.vendorId ? order.vendorId.toString() : '';
      if (!vendorOrders.has(vendorId)) {
        vendorOrders.set(vendorId, []);
      }
      vendorOrders.get(vendorId).push(order);
    });

    // Returning vendors (received more than 1 order)
    stats.returningVendors = Array.from(vendorOrders.values())
      .filter(vendorOrderList => vendorOrderList.length > 1).length;

    // Active vendors in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    stats.activeVendorsLast30Days = Array.from(vendorOrders.values())
      .filter(vendorOrderList => 
        vendorOrderList.some(order => new Date(order.createdAt) >= thirtyDaysAgo)
      ).length;

    return stats;
  }

  async getServiceProviderStats() {
    const providers = await Vendor.find({ vendorType: VendorType.SERVICE_PROVIDER });
    const bookings = await Booking.find();

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalServiceProviders: 0,
      newProvidersThisMonth: 0,
      returningProviders: 0,
      activeProvidersLast30Days: 0
    };

    // Total service providers
    stats.totalServiceProviders = providers.length;

    // New providers this month
    stats.newProvidersThisMonth = providers.filter(provider => {
      const createdAt = new Date(provider.createdAt);
      return createdAt >= firstDayOfMonth;
    }).length;

    // Get unique provider IDs who have received bookings
    const providerBookings = new Map();
    bookings.forEach(booking => {
      const providerId = booking.providerId ? booking.providerId.toString() : '';
      if (!providerBookings.has(providerId)) {
        providerBookings.set(providerId, []);
      }
      providerBookings.get(providerId).push(booking);
    });

    // Returning providers (received more than 1 booking)
    stats.returningProviders = Array.from(providerBookings.values())
      .filter(providerBookingList => providerBookingList.length > 1).length;

    // Active providers in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    stats.activeProvidersLast30Days = Array.from(providerBookings.values())
      .filter(providerBookingList => 
        providerBookingList.some(booking => new Date(booking.createdAt) >= thirtyDaysAgo)
      ).length;

    return stats;
  }

  async createSpecialOffer(data: {product: string, discount: number, startDate?: Date, endDate?: Date}) {
    let response = await new SpecialOffers(data).save();
    return response;
  }

  async getAllSpecialOffers() {
    let response = await SpecialOffers.find({}).populate({
      path: "product",
      populate: {
        path: "vendor"
      }
    });
    const specialOffers = response.map(offer => {
      const { product, ...rest } = offer.toObject();
      return {
        ...rest,
        product: product,
        vendor: product.vendor,
      };
    });
    return specialOffers;
  }

  async getSpecialOfferById(id: string) {
    return SpecialOffers.findById(id);
  }

  async updateSpecialOffer(id: string, data: Partial<SpecialOffersInterface>) {
    return SpecialOffers.findByIdAndUpdate(id, data);
  }

  async deleteSpecialOffer(id: string) {
    return SpecialOffers.findByIdAndDelete(id);
  }
  
  async findAllOrders(){
    let orders = await Order.find().populate("userId").populate("addressId");
    return orders;
  }

  async findOrderById(orderId: string){
    let order = await Order.findById(orderId).populate("userId").populate("addressId");
    return order;
  }

  async findOrdersByUserId(userId: string){
    let orders = await Order.find({userId: userId}).populate("userId").populate("addressId");
    return orders;
  }

  async findOrdersByVendorId(vendorId : string){
    let orders = await Order.find({vendorId}).populate("userId").populate("addressId");
    return orders;
  }

  async findAllProvider(){
    let providers = await Provide.find();
    return providers;
  }

  async getVendorBusinessInformation(vendorId: string){
    let response = await BusinessInfo.findOne({vendorId});
    return response;
  }

  async getVendorBusinessDetails(vendorId: string){
    let response = await BusinessDetail.findOne({vendorId});
    return response;
  }

  async getVendorCustomerCareInformation(vendorId: string){
    let response = await CustomerCareDetail.findOne({vendorId});
    return response;
  }

  async getVendorAddressInformation(vendorId: string){
    let response = await ShippingInfo.findOne({vendorId});
    return response;
  }

  async getVendorPaymentInformation(vendorId: string){
    let response = await PaymentInfo.findOne({vendorId});
    return response;
  }

  async getAdditionalInformation(vendorId: string){
    let response = await AdditionalInfo.findOne({vendorId});
    return response;
  }
  
  async getProviderLegalInformation(vendorId: string){
    let response = await LegalRep.findOne({vendorId});
    return response;
  }

  async getProviderMeansOfIdentification(vendorId: string){
    let response = await MeansIdentification.findOne({vendorId});
    return response;
  }

  async getStoreFront(vendorId: string){
    let response = await StoreFront.findOne({vendorId});
    return response;
  }

  async getAllVendorKYCDetails(vendorId: string) {
    const [
      businessInfo,
      businessDetails, 
      customerCare,
      shippingAddress,
      paymentInfo,
      additionalInfo,
      legalInfo,
      identification,
      storefront
    ] = await Promise.all([
      BusinessInfo.findOne({vendorId}).populate('vendorId'),
      BusinessDetail.findOne({vendorId}).populate('vendorId'),
      CustomerCareDetail.findOne({vendorId}).populate('vendorId'),
      ShippingInfo.findOne({vendorId}).populate('vendorId'),
      PaymentInfo.findOne({vendorId}).populate('vendorId'),
      AdditionalInfo.findOne({vendorId}).populate('vendorId'),
      LegalRep.findOne({vendorId}).populate('vendorId'),
      MeansIdentification.findOne({vendorId}).populate('vendorId'),
      StoreFront.findOne({vendorId}).populate('vendorId')
    ]);

    return {
      businessInfo,
      businessDetails,
      customerCare,
      shippingAddress, 
      paymentInfo,
      additionalInfo,
      legalInfo,
      identification,
      storefront
    };
  }

  async getKYCStats() {
    const [
      businessInfos,
      businessDetails,
      customerCares,
      shippingAddresses, 
      paymentInfos,
      additionalInfos,
      legalInfos,
      identifications,
      storefronts
    ] = await Promise.all([
      BusinessInfo.find(),
      BusinessDetail.find(),
      CustomerCareDetail.find(),
      ShippingInfo.find(),
      PaymentInfo.find(),
      AdditionalInfo.find(),
      LegalRep.find(),
      MeansIdentification.find(),
      StoreFront.find()
    ]);

    const allSubmissions = [
      ...businessInfos,
      ...businessDetails,
      ...customerCares,
      ...shippingAddresses,
      ...paymentInfos,
      ...additionalInfos,
      ...legalInfos,
      ...identifications,
      ...storefronts
    ];

    const totalSubmitted = allSubmissions.length;
    const pendingKYC = allSubmissions.filter(submission => submission.status === KYCStatus.PENDING).length;
    const approvedKYC = allSubmissions.filter(submission => submission.status === KYCStatus.APPROVED).length;
    const rejectedKYC = allSubmissions.filter(submission => submission.status === KYCStatus.REJECTED).length;

    return {
      totalSubmitted,
      pendingKYC,
      approvedKYC,
      rejectedKYC
    };
  }

  async getAllSubmittedKYC() {
    const [
      businessInfos,
      businessDetails,
      customerCares, 
      shippingAddresses,
      paymentInfos,
      additionalInfos,
      legalInfos,
      identifications,
      storefronts
    ] = await Promise.all([
      BusinessInfo.find().populate('vendorId'),
      BusinessDetail.find().populate('vendorId'),
      CustomerCareDetail.find().populate('vendorId'),
      ShippingInfo.find().populate('vendorId'),
      PaymentInfo.find().populate('vendorId'),
      AdditionalInfo.find().populate('vendorId'),
      LegalRep.find().populate('vendorId'),
      MeansIdentification.find().populate('vendorId'),
      StoreFront.find().populate('vendorId')
    ]);

    // const allSubmissions = [
    //   ...businessInfos.map(info => ({ ...info.toObject(), type: 'businessInfo', typeText: 'Business Information' })),
    //   ...businessDetails.map(detail => ({ ...detail.toObject(), type: 'businessDetail', typeText: 'Business Details' })),
    //   ...customerCares.map(care => ({ ...care.toObject(), type: 'customerCare', typeText: 'Customer Care' })),
    //   ...shippingAddresses.map(address => ({ ...address.toObject(), type: 'shippingAddress', typeText: 'Shipping Address' })),
    //   ...paymentInfos.map(payment => ({ ...payment.toObject(), type: 'paymentInfo', typeText: 'Payment Information' })),
    //   ...additionalInfos.map(info => ({ ...info.toObject(), type: 'additionalInfo', typeText: 'Additional Information' })),
    //   ...legalInfos.map(legal => ({ ...legal.toObject(), type: 'legalInfo', typeText: 'Legal Information' })),
    //   ...identifications.map(id => ({ ...id.toObject(), type: 'identification', typeText: 'Identification' })),
    //   ...storefronts.map(front => ({ ...front.toObject(), type: 'storefront', typeText: 'Storefront' }))
    // ];

    const allSubmissions = [
      ...businessInfos.map(info => ({ ...info.toObject(), type: 'businessInfo', typeText: 'Business Information' })),
      ...businessDetails.map(detail => ({ ...detail.toObject(), type: 'businessDetail', typeText: 'Business Details' })),
      ...customerCares.map(care => ({ ...care.toObject(), type: 'customerCare', typeText: 'Customer Care' })),
      ...shippingAddresses.map(address => ({ ...address.toObject(), type: 'shippingAddress', typeText: 'Shipping Address' })),
      ...paymentInfos.map(payment => ({ ...payment.toObject(), type: 'paymentInfo', typeText: 'Payment Information' })),
      ...additionalInfos.map(info => ({ ...info.toObject(), type: 'additionalInfo', typeText: 'Additional Information' })),
      ...legalInfos.map(legal => ({ ...legal.toObject(), type: 'legalInfo', typeText: 'Legal Information' })),
      ...identifications.map(id => ({ ...id.toObject(), type: 'identification', typeText: 'Identification' })),
      ...storefronts.map(front => ({ ...front.toObject(), type: 'storefront', typeText: 'Storefront' }))
    ];

    // Create a Map to store unique submissions by vendorId
    const uniqueSubmissionsMap = new Map();
    
    // Iterate through submissions and keep only the latest one per vendor
    allSubmissions.forEach(submission => {
      const vendorId = submission.vendorId?._id.toString();
      if(!vendorId) return;
      const existingSubmission = uniqueSubmissionsMap.get(vendorId);
      
      if (!existingSubmission || new Date(submission.createdAt) > new Date(existingSubmission.createdAt)) {
        uniqueSubmissionsMap.set(vendorId, submission);
      }
    });

    // Convert Map values back to array
    const uniqueSubmissions = Array.from(uniqueSubmissionsMap.values());

    uniqueSubmissions.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return uniqueSubmissions;
  };

  async updateKYCStatus(type: string, id: string, status: VendorStatus, rejectionMessage?: string) {
    let Model;
    switch(type) {
      case 'businessInfo':
        Model = BusinessInfo;
        break;
      case 'businessDetail':
        Model = BusinessDetail;
        break;
      case 'customerCare':
        Model = CustomerCareDetail;
        break;
      case 'shippingAddress':
        Model = ShippingInfo;
        break;
      case 'paymentInfo':
        Model = PaymentInfo;
        break;
      case 'additionalInfo':
        Model = AdditionalInfo;
        break;
      case 'legalInfo':
        Model = LegalRep;
        break;
      case 'identification':
        Model = MeansIdentification;
        break;
      case 'storefront':
        Model = StoreFront;
        break;
      default:
        throw new HttpError('Invalid KYC type', 400);
    }

    const doc = await Model.findOneAndUpdate(
      { vendorId: id },
      { status, rejectionMessage },
      { new: true }
    ).populate('vendorId');

    if (!doc) {
      throw new HttpError('Document not found', 404);
    }

    return {
      ...doc.toObject(),
      type,
      typeText: this.getTypeText(type)
    };
  }

  private getTypeText(type: string): string {
    const typeTextMap = {
      businessInfo: 'Business Information',
      businessDetail: 'Business Details', 
      customerCare: 'Customer Care',
      shippingAddress: 'Shipping Address',
      paymentInfo: 'Payment Information',
      additionalInfo: 'Additional Information',
      legalInfo: 'Legal Information',
      identification: 'Identification',
      storefront: 'Storefront'
    };
    return typeTextMap[type] || type;
  }

  async signIn({ email, password }) {
    const admin = await Admin.findOne({ email });
    console.log('admin', admin);
    if (!admin) {
      throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!admin.isActive) {
      throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 403);
    }

    // Update last login
    await Admin.findByIdAndUpdate(admin._id, {
      lastLogin: new Date()
    });

    // Generate JWT token
    const token = this.getSignedToken(admin);

    return {
      token,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }
    };
  }
  getSignedToken(admin: IAdmin) {
    return jwt.sign({ id: admin._id }, Config.JWT_KEY, { expiresIn: Config.JWT_TIMEOUT });
  }

  adminRevenueOrderTable(time: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    return this._analytics.revenueOrderTable(time);
  }

  adminDashboardCards() {
    return this._analytics.adminDashboardCards();
  }

  adminDashboardServiceCards() {
    return this._analytics.adminDashboardServiceCards();
  }

  adminTransactionMetrics() {
    return this._analytics.getTransactionMetrics();
  }

  async getAllTransactions() {
    return await Transaction.find().populate("userId");
  }

  bookingSummary(startDate: string, endDate: string) {
    return this._analytics.bookingSummary(startDate, endDate);
  }

  
  bookingStatistics() {
    return this._analytics.bookingStatistics();
  }

  salesByCategory() {
    return this._analytics.salesByCategory();
  }

  userGrowth(startDate: string, endDate: string) {
    return this._analytics.userGrowth(startDate, endDate);
  }

  topSellingProduct() {
    return this._analytics.topSellingProduct();
  }

  topService() {
    return this._analytics.topService();
  }

  topProvider() {
    return this._analytics.topProvider();
  }

  adminVendorCards() {
    return this._analytics.adminVendorCards();
  }

  orderCards() {
    return this._analytics.orderCards();
  }

  userCards() {
    return this._analytics.userCards();
  }

  block(userId: string) {
    return this._userService().block(userId);
  }

  reviews() {
    return this._reviewService().find(
      {},
      {
        populate: {
          path: 'userId',
          model: 'User',
          select: 'firstName lastName avatar',
        },
      },
    );
  }

  async hype(productId: string) {
    const product = await this._productService().findOne(productId);
    return this._productService().update(productId, { hype: !product?.hype });
  }

  async blockProduct(productId: string) {
    const product = await this._productService().findOne(productId);
    return this._productService().update(productId, { blocked: !product?.blocked });
  }

  async blockService(serviceId: string) {
    const service = await this.__provideService().findOne(serviceId);
    return this.__provideService().update(serviceId, { blocked: !service?.blocked });
  }

  getProviders(query: Record<string, any>) {
    return this._userService().paginatedFind({ ...query, isProvider: true });
  }

  getVendors(){
    return this._vendorService.find()
  }

  getCustomers(query: Record<string, any>) {
    const q = { $gte: 1 } as any;
    return this._userService().paginatedFind();
  }

  getCustomerById(id: string) {
    return this._userService().findOne({_id: id})
  }

  getBookings(query: Record<string, any>, userId: string, isProvider = true) {
    const q = isProvider ? { customerId: userId } : { providerId: userId };
    return this._bookingService().paginatedFind({ ...query, ...q });
  }

  updateServiceStatus(serviceId: string, status: ServiceStatusEnum) {
    return this.__provideService().update(serviceId, { status });
  }

  async getKYCLogs(vendorId: string){
    let response = await KYClogs.find({vendorId});
    return response;
  }

  async getAllKYCLogs(){
    let response = await KYClogs.find();
    return response;
  }

  async getKYCLogById(logId: string){
    let response = await KYClogs.findById(logId);
    return response;
  }

  async updateKYCLog(logId: string, data: any){
    let response = await KYClogs.findByIdAndUpdate(logId, data);
    return response;
  }

  async createKYCLog(data: KYClogsInterface){
    let response = await KYClogs.create(data);
    return response;
  }
  

}

export default AdminService;
