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
class AdminService extends UserService {
  private _analytics = new AnalyticsService();
  private _userService = UserService.instance;
  private _reviewService = ReviewService.instance;
  private _productService = ProductService.instance;
  private __provideService = ProvideService.instance;
  private _bookingService = BookingService.instance;
  private _vendorService = VendorService.instance;
  private _orderService = OrderService.instance;   

  async findAllProvider(){
    let providers = await Provide.find();
    return providers;
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
}

export default AdminService;
