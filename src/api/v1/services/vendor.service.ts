import HttpError from '@helpers/HttpError';
import Service from '@services/service';
import * as Config from '@config';
import VendorRepository from '@repositories/Vendor.repo';
import { VendorInterface, VendorStatus, VendorType } from '@interfaces/Vendor.Interface';
import { TokenInterface, TokenTypeEnum } from '@interfaces/Token.Interface';
import jwt from 'jsonwebtoken';
import { logger } from '@utils/logger';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import dayjs from 'dayjs';
import Emailing from '@helpers/vendor.mailer';
import AuthVendorSessionRepository from '@repositories/AuthVendorSession.repo';
import VendorTokenService from './vendor.token.service';
import generateToken from '@utils/generateToken';
import { VendorTokenInterface } from '@interfaces/VendorToken.Interface';
import { AuthVendorSessionInterface } from '@interfaces/AuthVendorSession.Interface';
import { VERSION } from 'lodash';
import ProductRepository from '@repositories/Product.repo';
import OrderRepository from '@repositories/Order.repo';
import { DeliveryStatus, OrderStatus } from '@interfaces/Order.Interface';
import ProvideRepository from '@repositories/Provide.repo';
import BookingRepository from '@repositories/Booking.repo';
import Order from '@models/Order';
import Quote from '@models/Quote';
import ServiceProfile from '@models/ServiceProfile';
import Review from '@models/Review';
import Vendor from '@models/Vendor';
import ShippingInfo from '@models/ShippingInfo';
import { BookingStatus } from '@interfaces/Booking.Interface';
import Transaction from '@models/Transaction';
import Wallet from '@models/Wallet';

class VendorService extends Service<VendorInterface, VendorRepository> {
  protected repository = new VendorRepository();
  protected repositoryAuthSession = new AuthVendorSessionRepository();
  private readonly _tokenService = VendorTokenService.instance;
  private static _instance: VendorService;
  private readonly _emailing = Emailing;
  useSessions = Config.OPTIONS.USE_AUTH_SESSIONS;
  useRefreshToken = Config.OPTIONS.USE_REFRESH_TOKEN;
  private readonly productRepo = new ProductRepository();
  private readonly provideRepo = new ProvideRepository();
  private readonly bookingRepo = new BookingRepository();
  private readonly orderRepo = new OrderRepository();

  async find(){
    return await this.repository.find();
  }

    async getVendors(){
      return await this.repository.find({status: VendorStatus.ACTIVE, vendorType: VendorType.MARKET_SELLER});
    }

    async getServiceProvider(){
      return await this.repository.find({status: VendorStatus.ACTIVE, vendorType: VendorType.SERVICE_PROVIDER});
    }

  async block(vendorId: string) {
    const vendor = await this.findOne(vendorId);
    if (!vendor) throw new HttpError('invalid vendor', 404);
    return this.update(vendorId, { blocked: !vendor.blocked });
  }

  async getFeatured(vendorType: VendorType) {
    try {
      const vendors = await this.find({ status: VendorStatus.ACTIVE, vendorType });

      return vendors;
    } catch (error) {
      throw error;
    }
  }

  async getMarketSellerDashboardStats(vendorId: string) {
    const totalListedProducts = await this.productRepo.count({ vendor: vendorId });
    // const totalOrders = await this.orderRepo.find({ vendor: vendorId, orderStatus: OrderStatus.PAID });
    // const totalShippedOrders = await this.orderRepo.count({ vendor: vendorId, deliveryStatus: DeliveryStatus.SHIPPED });

    const startDate = new Date('2024-12-01');
    const endDate = new Date('2024-12-31');

    const totalShippedOrders = await this.orderRepo.custom().countDocuments({
      $and: [
          {
            vendor: vendorId
          },
          {
            createdAt: { $gte: startDate, $lte: endDate }
          },
          {
            deliveryStatus: DeliveryStatus.SHIPPED
          }
      ]
     });


     const totalOrders = await this.orderRepo.custom().find({
      $and: [
          {
            vendor: vendorId
          },
          // {
          //   createdAt: { $gte: startDate, $lte: endDate }
          // },
          {
            orderStatus: OrderStatus.PAID
          }
      ]
     });

    const totalRevenue = totalOrders.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0);

    const totalItemsSold = totalOrders.length;

    return {
      totalRevenue,
      totalItemsSold,
      totalShippedOrders,
      totalListedProducts,
      revenueBreakDown: []
    }
  }

  getFollow(userId: string, followers = true, page = 1, limit = 10) {
    const followType = followers ? 'followers' : 'following';
    return new Promise((resolve, reject) => {
      let totalDocs = 0;
      let totalPages = 0;
      this.custom()
        .findById(userId)
        .then((user) => {
          if (!user) {
            reject(new HttpError('invalid user', 404));
          }
          totalDocs = (user![followType] as string[]).length;
          totalPages = Math.floor(totalDocs / limit) + 1;
          if (page > totalPages) reject(new HttpError('invalid page', 400));
          const query = (user![followType] as string[]).reverse().slice(page - 1, page + limit);
          return this.find({}, { in: { query: '_id', in: query } });
        })
        .then((users) => {
          const result = {
            totalDocs,
            totalPages,
            page,
            limit,
            data: users,
          };
          resolve(result);
        })
        .catch((error) => {
          throw error;
        });
    });
  }

  async toggleFollow(vendorId: string, userId: string) {
    const vendor = await this.findOne(vendorId);
    const followUser = await this.findOne(userId);
    if (!vendor || !followUser) throw new HttpError('invalid user', 404);

    const isFollowing = await this.custom().findOne({ _id: vendorId, following: { $in: [userId] } });

    if (isFollowing) {

      return await this.custom().findByIdAndUpdate(
        vendorId,
        {
          $pull: { following: userId },
        },
        { new: true },
      );
    } 
    else 
    {
      this.custom().findByIdAndUpdate(
        vendorId,
        {
          $addToSet: { followers: userId },
          // Set or update the id field
        },
        { new: true },
      );

      return await this.custom().findByIdAndUpdate(
        userId,
        {
          $addToSet: { following: followId },
        },
        { new: true },
      );
    }
  }

  async iAmFollowing(me: string, user: string | Partial<VendorInterface>) {
    if (typeof user !== 'string') {
      return false;
    }
    return !!(await this.custom().findOne({ _id: me, following: { $in: [user] } }));
  }

  async isFollowingMe(me: string, user: string | Partial<VendorInterface>) {
    if (typeof user !== 'string') {
      return false;
    }
    return !!(await this.custom().findOne({ _id: user, following: { $in: [me] } }));
  }

  async getServiceProviderDashboardStats(vendorId: string) {
    let balance = (await Wallet.findOne({vendorId})).balance;
    let dailyJobRequests = await this.bookingRepo.count({vendorId, createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) } });
    return {
      totalRevenue: balance,
      totalJobs: await this.provideRepo.count({ vendorId }),
      totalDailyRequests: dailyJobRequests,
      revenueBreakDown: []
    }
  }

  async getPopularServiceProvider() {
    try {
      const vendors = await this.find({ vendorType: VendorType.SERVICE_PROVIDER, status: VendorStatus.ACTIVE });

      return vendors;
    } catch (error) {
      throw error;
    }
  }

  getOne(vendorId: string) {
    return this.findOne(
      { _id: vendorId });
  }

  static instance() {
    if (!VendorService._instance) {
      VendorService._instance = new VendorService();
    }
    return VendorService._instance;
  }

    async getMonthlyRevenueAndOrders(vendorId: string, type: VendorType) {
      // Initialize data structure for all months
      const months = [...Array(12)].map((_, i) => ({
        month: new Date(2023, i).toLocaleString('default', { month: 'short' }),
        revenue: 0,
        orders: 0
      }));
  
      // Get all orders for the current year
      const currentYear = new Date().getFullYear();

      if(type === VendorType.MARKET_SELLER) {
        const orders = await Order.find({
          vendorId,
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        });
    
        // Aggregate data by month
        orders.forEach(order => {
          const monthIndex = new Date(order.createdAt).getMonth();
          months[monthIndex].orders++;
          months[monthIndex].revenue += order.total || 0;
        });
    
        return {
          labels: months.map(m => m.month),
          datasets: [
            {
              label: 'Revenue',
              data: months.map(m => m.revenue),
              borderColor: "#496FA8"
            },
            {
              label: 'Orders',
              data: months.map(m => m.orders),
              borderColor: "#EF8D1A"
            }
          ]
        };
      }
      
      else {
        const bookings = await Quote.find({
          vendorId,
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        });
    
        // Aggregate data by month
        bookings.forEach(booking => {
          const monthIndex = new Date(booking.createdAt).getMonth();
          months[monthIndex].orders++;
          months[monthIndex].revenue += booking.amount || 0;
        });
    
        return {
          labels: months.map(m => m.month),
          datasets: [
            {
              label: 'Revenue',
              data: months.map(m => m.revenue),
              borderColor: "#496FA8"
            },
            {
              label: 'Bookings',
              data: months.map(m => m.orders),
              borderColor: "#EF8D1A"
            }
          ]
        };
      }
    }

    async getVendorProfile(vendorId: string){
      const vendor = await Vendor.findOne({_id: vendorId}).lean();
      const profile = await ServiceProfile.findOne({vendorId}).lean();
      const vendorReviews = await Review.find({vendorId}).lean();
      const shippingInfo = await ShippingInfo.findOne({vendorId}).lean();
      const totalCompletedJobs = await Quote.countDocuments({vendorId, status: BookingStatus.COMPLETED});
      

      return {
        ...profile,
        firstName: vendor?.firstname,
        lastName: vendor?.lastname,
        rating: vendorReviews?.reduce((acc, review) => acc + review.rating, 0) / vendorReviews.length || 0,
        totalCompletedJobs,
        reviews: vendorReviews,
        profilePicture: vendor?.profilePicture || null,
        location: shippingInfo?.shippingAddress || null
      };
    }

    async getVendorTransactions(vendorId: string, fromDate?: Date, toDate?: Date) {
      const vendor = await this.findOne(vendorId);
      if (!vendor) throw new HttpError('Invalid vendor', 404);

      const dateFilter: any = {};
      if (fromDate || toDate) {
        dateFilter.createdAt = {};
        if (fromDate) dateFilter.createdAt.$gte = fromDate;
        if (toDate) dateFilter.createdAt.$lte = toDate;
      }

      if (vendor.vendorType === VendorType.MARKET_SELLER) {
        const orders = await Order.find({
          vendor: vendorId,
          orderStatus: OrderStatus.PAID,
          ...dateFilter
        }).sort({ createdAt: -1 }).populate('userId').populate("vendorId").populate("serviceId");

        return orders.map(order => ({
          type: 'order',
          id: order._id,
          amount: order.total,
          status: order.orderStatus,
          date: order.createdAt,
          customer: order.userId,
          items: order.items
        }));
      } else {
        const quotes = await Quote.find({
          vendorId,
          
        }).sort({ createdAt: -1 }).populate('userId').populate("serviceId");

        

        return quotes.map(quote => ({
          type: 'service',
          id: quote._id,
          amount: quote.amount,
          status: quote.status,
          date: quote.createdAt,
          customer: quote.userId,
          service: quote.serviceId
        }));
      }
    }

    async getVendorTransactionHistory(vendorId: string, fromDate?: Date, toDate?: Date) {
      const vendor = await this.findOne(vendorId);
      if (!vendor) throw new HttpError('Invalid vendor', 404);

      const dateFilter: any = {};
      if (fromDate || toDate) {
        dateFilter.date = {};
        if (fromDate) dateFilter.date.$gte = fromDate;
        if (toDate) dateFilter.date.$lte = toDate;
      }

      const transactions = await Transaction.find({
        userId: vendorId,
        ...dateFilter
      })
      .populate('userId')
      .sort({ date: -1 });

      return transactions.map(transaction => ({
        id: transaction._id,
        amount: transaction.amount,
        type: transaction.event,
        date: transaction.date,
        description: transaction.description,
        paymentMethod: transaction.paymentMethod,
        reference: transaction.reference,
        success: transaction.success
      }));
    }
}

export default VendorService;
