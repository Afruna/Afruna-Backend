import { DeliveryStatus, OrderInterface } from '@interfaces/Order.Interface';
import OrderService from './order.service';
import ProductService from './product.service';
import dayjs, { Dayjs } from 'dayjs';
import UserService from './user.service';
import { UserRole } from '@interfaces/User.Interface';
import ProvideService from './provide.service';
import BookingService from './booking.service';

export default class AnalyticsService {
  /**
   *
   */
  constructor(
    private _productService = ProductService.instance,
    private _orderService = OrderService.instance,
    private _userService = UserService.instance,
    private _provideService = ProvideService.instance,
    private _bookingService = BookingService.instance,
  ) {}

  get x() {
    return () => new UserService();
  }
  forEveryInterval = async <T>(
    interval: 'hour' | 'day' | 'week' | 'month',
    startDate: dayjs.Dayjs,
    endDate: dayjs.Dayjs,
    callback: (_currentDay: dayjs.Dayjs, index: number) => Promise<T>,
  ) => {
    const result: T[] = [];
    let currentDay = startDate.startOf('day');
    const _endDate = dayjs(endDate).add(1, 'day');
    let idx = 0;
    while (currentDay.isBefore(_endDate, 'day')) {
      const data = await callback(currentDay, idx); //.then((data) => {
      result.push(data);
      idx++;
      currentDay = currentDay.add(1, interval);
      // });
    }
    return result;
  };
  listedProducts(vendorId: string) {
    return this._productService().count({ vendorId });
  }

  // totalOrders(vendorId?: string) {

  // }

  shippedOrders(vendorId: string) {
    return this._orderService().count({ vendorId, deliveryStatus: DeliveryStatus.SHIPPED });
  }

  canceledOrders(vendorId: string) {
    return this._orderService().count({ vendorId, isCanceled: true });
  }

  async getAllSuccessfulTransactions() {
    const result = await this._orderService()
      .custom()
      .aggregate([
        {
          $match: {
            isPaid: true,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]);
    return (result[0]?.total as number) || 0;
  }

  async vendorCards(userId: string) {
    const listedProducts = await this.listedProducts(userId);
    const totalOrders = await this._orderService().count({ vendorId: userId, isPaid: true });
    const shippedOrders = await this.shippedOrders(userId);
    const canceledOrders = await this.canceledOrders(userId);
    return {
      listedProducts,
      totalOrders,
      shippedOrders,
      canceledOrders,
    };
  }
  async revenueOrderTable(time: 'daily' | 'weekly' | 'monthly' | 'yearly', userId?: string) {
    const interval = {
      daily: [
        'hour',
        24,
        'hour',
        (hour: number) => {
          return dayjs().hour(hour).format('h A');
        },
      ],
      weekly: [
        'day',
        7,
        'day',
        (weekdayIndex: number) => {
          return dayjs().day(weekdayIndex).format('dddd');
        },
      ],
      monthly: [
        'day',
        1,
        'month',
        (dayOfMonth: number) => {
          return dayjs().date(dayOfMonth).format('MMMM D');
        },
      ],
      yearly: [
        'month',
        12,
        'month',
        (monthIndex: number) => {
          return dayjs().month(monthIndex).format('MMMM');
        },
      ],
    } as const;
    const filter = {} as any;
    if (userId) filter.vendorId = userId;
    const result = await this.forEveryInterval<{
      date: string;
      revenue: number;
      order: number;
    }>(
      interval[time][0],
      dayjs().startOf(interval[time][0]),
      dayjs(interval[time][0]).add(interval[time][1], interval[time][2]),
      async (date, index) => {
        return (
          await this._orderService().find(<OrderInterface>(<unknown>{
            ...filter,
            createdAt: {
              $gte: date.format(),
              $lte: date.endOf(interval[time][0]).format(),
            },
          }))
        ).reduce(
          (prev, doc) => {
            prev.revenue = prev.revenue + doc.total;
            prev.order = prev.order + 1;
            return prev;
          },
          {
            date: interval[time][3](index),
            revenue: 0,
            order: 0,
          },
        );
      },
    );

    return result;
  }

  async adminDashboardCards() {
    // TODO:
    const totalOrders = await this._orderService().count({ isPaid: true });
    const totalEarnings = await this.getAllSuccessfulTransactions();
    const totalUsers = await this._userService().count();
    const totalProducts = await this._productService().count();
    return {
      totalEarnings,
      totalOrders,
      totalUsers,
      totalProducts,
    };
  }

  async adminDashboardServiceCards() {
    // TODO:
    const totalProviders = await this._userService().count({ isVendor: true });
    const totalEarnings = await this.getAllSuccessfulTransactions();
    const totalUsers = await this._userService().count();
    const totalServices = await this._provideService().count();
    return {
      totalEarnings,
      totalProviders,
      totalUsers,
      totalServices,
    };
  }

  salesByCategory() {
    return this._productService()
      .custom()
      .aggregate([
        {
          $group: {
            _id: '$categoryId',
            totalPrice: { $sum: { $multiply: ['$sold', '$price'] } },
          },
        },
        {
          $lookup: {
            from: 'categories', // Collection name for Category model
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $unwind: '$category',
        },
        {
          $group: {
            _id: null,
            categories: {
              $push: {
                categoryName: '$category.name',
                totalPrice: '$totalPrice',
              },
            },
            totalSalesAllCategories: { $sum: '$totalPrice' },
          },
        },
        {
          $project: {
            _id: 0,
            categories: 1,
            totalSalesAllCategories: 1,
          },
        },
        {
          $unwind: '$categories',
        },
        {
          $addFields: {
            salesPercentage: {
              $cond: {
                if: { $eq: ['$totalSalesAllCategories', 0] },
                then: 0,
                else: {
                  $multiply: [{ $divide: ['$categories.totalPrice', '$totalSalesAllCategories'] }, 100],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: '$categories.categoryName',
            salesPercentage: { $sum: '$salesPercentage' },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);
  }

  userGrowth(startDate: string, endDate: string) {
    return this._userService()
      .custom()
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
          },
        },
      ]);
  }

  async bookingStatistics() {
    const total = await this._bookingService().count();
    return this._bookingService()
      .custom()
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            percentage: {
              $round: [{ $multiply: [{ $divide: ['$count', total] }, 100] }],
            },
          },
        },
      ]);
  }

  bookingSummary(startDate: string, endDate: string) {
    return this._bookingService()
      .custom()
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: dayjs(startDate),
              $lt: dayjs(endDate),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
          },
        },
      ]);
  }

  topSellingProduct() {
    return this._productService().custom().find().sort({ sold: -1 }).limit(5);
  }
  topService() {
    return this._provideService()
      .custom()
      .find()
      .populate({ path: 'providerId', model: 'User' })
      .sort({ booked: -1 })
      .limit(5);
  }
  topProvider() {
    return this._userService().custom().find({ isVendor: true }).sort({ booked: -1 }).limit(5);
  }
  async adminVendorCards() {
    const totalVendors = await this._userService().count({ role: UserRole.VENDOR });
    const listedProducts = await this._productService().count();
    return {
      totalVendors,
      listedProducts,
    };
  }

  async orderCards() {
    const newOrder = await this._orderService().count(<any>{
      createdAt: { $gte: dayjs().subtract(1, 'week').format() },
    });
    const pending = await this._orderService().count({ deliveryStatus: DeliveryStatus.PENDING });
    const delivered = await this._orderService().count({ deliveryStatus: DeliveryStatus.DELIVERED });
    const canceled = await this._orderService().count({ deliveryStatus: DeliveryStatus.CANCELED });
    return {
      newOrder,
      pending,
      delivered,
      canceled,
    };
  }
  async userCards() {
    const total = await this._userService().count();
    const active = await this._userService().count({ online: true });
    const inactive = await this._userService().count({ online: false });
    return {
      total,
      active,
      inactive,
    };
  }
  async reportCards(userId: string) {
    const todayOrder = await this._orderService().count({
      vendorId: userId,
      isPaid: true,
      createdAt: { $gte: dayjs().startOf('day').format() },
    });
    const yesterdayOrder = await this._orderService().count({
      vendorId: userId,
      isPaid: true,
      createdAt: { $gte: dayjs().subtract(1, 'day').startOf('day').format(), $lte: dayjs().format() },
    });
    const todayRevenue = (
      await this._orderService().find({
        vendorId: userId,
        isPaid: true,
        createdAt: { $gte: dayjs().startOf('day').format() },
      })
    ).reduce((total, doc) => {
      return doc.total + total;
    }, 0);
    const yesterdayRevenue = (
      await this._orderService().find({
        vendorId: userId,
        isPaid: true,
        createdAt: { $gte: dayjs().subtract(1, 'day').startOf('day').format(), $lte: dayjs().format() },
      })
    ).reduce((total, doc) => {
      return doc.total + total;
    }, 0);

    return {
      order: {
        today: todayOrder,
        yesterdayPercentage: ((todayOrder - yesterdayOrder) / yesterdayOrder) * 100,
      },
      revenue: {
        today: todayRevenue,
        yesterdayPercentage: ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100,
      },
      visitors: 0,
    };
  }
  visitTable() {}
}
