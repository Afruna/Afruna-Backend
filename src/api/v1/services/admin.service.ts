import UserService from '@services/user.service';
import AnalyticsService from '@services/analytics.service';
import ProductService from './product.service';
import OrderService from './order.service';
import ReviewService from './review.service';
import ProvideService from './provide.service';
import VendorService from "./vendor.service";
import BookingService from './booking.service';
import { ServiceStatusEnum } from '@interfaces/Provide.Interface';
import Admin, { AdminRole, IAdmin } from '@models/Admin';
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
import axios from 'axios';
import { DateFilter, getDateRange } from '@utils/dateRange';
import { calculateMetrics } from '@utils/metrics';
import Tags, { ITags } from '@models/Tags';
import KycLogsService from './kycLogs.service';
import mongoose from 'mongoose';
import Wallet from '@models/Wallet';
import { BookingStatus } from '@interfaces/Booking.Interface';
import Quote from '@models/Quote';

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
  private _kycLogsService = KycLogsService.instance;

  getDateRange = (filter: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    const start = new Date();
    
    switch(filter) {
      case 'daily':
        start.setDate(now.getDate() - 1);
        break;
      case 'weekly': 
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        break;
    }
    return { start, end: now };
  };

  async getProductStats(date?: string, dateFilter: DateFilter = 'daily') {
    let current: Date, previous: Date;
    if (date) {
      const d = new Date(date);
      previous = new Date(d.setHours(0, 0, 0, 0));
      current = new Date(d.setHours(23, 59, 59, 999));
    } else {
      ({ current, previous } = getDateRange(dateFilter));
    }
  
    // Get current and previous period metrics in parallel
    const [
      currentProducts,
      previousProducts
    ] = await Promise.all([
      Product.find({ createdAt: { $lte: current } }),
      Product.find({ createdAt: { $lte: previous } })
    ]);
  
    const calculateStats = (products: any[]) => ({
      total: products.length,
      inStock: products.filter(p => p.quantity > 10).length,
      lowStock: products.filter(p => p.quantity > 0 && p.quantity <= 10).length,
      outOfStock: products.filter(p => p.quantity === 0).length
    });
  
    const currentStats = calculateStats(currentProducts);
    const previousStats = calculateStats(previousProducts);
  
    return {
      totalProducts: {
        ...calculateMetrics(currentStats.total, previousStats.total, dateFilter),
        title: 'Total Products'
      },
      inStock: {
        ...calculateMetrics(currentStats.inStock, previousStats.inStock, dateFilter),
        title: 'In Stock'
      },
      lowStock: {
        ...calculateMetrics(currentStats.lowStock, previousStats.lowStock, dateFilter),
        title: 'Low Stock'
      },
      outOfStock: {
        ...calculateMetrics(currentStats.outOfStock, previousStats.outOfStock, dateFilter),
        title: 'Out of Stock'
      }
    };
  }

  async getOrderStats(date?: string, dateFilter: DateFilter = 'daily') {
    let current: Date, previous: Date;
    if (date) {
      const d = new Date(date);
      previous = new Date(d.setHours(0, 0, 0, 0));
      current = new Date(d.setHours(23, 59, 59, 999));
    } else {
      ({ current, previous } = getDateRange(dateFilter));
    }
  
    // Get current and previous period metrics in parallel
    const [
      currentOrders,
      previousOrders
    ] = await Promise.all([
      Order.find({ createdAt: { $lte: current } }),
      Order.find({ createdAt: { $lte: previous } })
    ]);
  
    const calculateStats = (orders: any[]) => ({
      total: orders.length,
      pending: orders.filter(order => order.orderStatus === OrderStatus.PENDING).length,
      fulfilled: orders.filter(order => order.orderStatus === OrderStatus.PAID).length,
      failed: orders.filter(order => order.orderStatus === OrderStatus.CANCELLED).length
    });
  
    const currentStats = calculateStats(currentOrders);
    const previousStats = calculateStats(previousOrders);
  
    return {
      totalOrders: {
        ...calculateMetrics(currentStats.total, previousStats.total, dateFilter),
        title: 'Total Orders'
      },
      pendingOrders: {
        ...calculateMetrics(currentStats.pending, previousStats.pending, dateFilter),
        title: 'Pending Orders'
      },
      fulfilledOrders: {
        ...calculateMetrics(currentStats.fulfilled, previousStats.fulfilled, dateFilter),
        title: 'Fulfilled Orders'
      },
      failedOrders: {
        ...calculateMetrics(currentStats.failed, previousStats.failed, dateFilter),
        title: 'Failed Orders'
      }
    };
  }

  async getCustomerStats(date?: string, dateFilter: DateFilter = 'daily') {
    let current: Date, previous: Date;
    if (date) {
      const d = new Date(date);
      previous = new Date(d.setHours(0, 0, 0, 0));
      current = new Date(d.setHours(23, 59, 59, 999));
    } else {
      ({ current, previous } = getDateRange(dateFilter));
    }
  
    // Get current and previous period metrics in parallel
    const [
      currentUsers,
      previousUsers,
      currentOrders,
      previousOrders
    ] = await Promise.all([
      User.find({ createdAt: { $lte: current } }),
      User.find({ createdAt: { $lte: previous } }),
      Order.find({ createdAt: { $lte: current } }),
      Order.find({ createdAt: { $lte: previous } })
    ]);
  
    const calculateStats = (users: any[], orders: any[]) => {
      const customerOrders = new Map();
      orders.forEach(order => {
        const userId = order.userId ? order.userId.toString() : '';
        if (!customerOrders.has(userId)) {
          customerOrders.set(userId, []);
        }
        customerOrders.get(userId).push(order);
      });
  
      return {
        totalCustomers: users.length,
        returningCustomers: Array.from(customerOrders.values())
          .filter(orders => orders.length > 1).length,
        activeCustomers: customerOrders.size,
        averageOrdersPerCustomer: customerOrders.size > 0 ? 
          Number((orders.length / customerOrders.size).toFixed(2)) : 0
      };
    };
  
    const currentStats = calculateStats(currentUsers, currentOrders);
    const previousStats = calculateStats(previousUsers, previousOrders);
  
    return {
      totalCustomers: {
        ...calculateMetrics(currentStats.totalCustomers, previousStats.totalCustomers, dateFilter),
        title: 'Total Customers'
      },
      returningCustomers: {
        ...calculateMetrics(currentStats.returningCustomers, previousStats.returningCustomers, dateFilter),
        title: 'Returning Customers'
      },
      activeCustomers: {
        ...calculateMetrics(currentStats.activeCustomers, previousStats.activeCustomers, dateFilter),
        title: 'Active Customers'
      },
      averageOrdersPerCustomer: {
        ...calculateMetrics(currentStats.averageOrdersPerCustomer, previousStats.averageOrdersPerCustomer, dateFilter),
        title: 'Average Orders Per Customer'
      }
    };
  }

  async getVendorStats(date?: string, dateFilter: DateFilter = 'daily') {
    let current: Date, previous: Date;
    if (date) {
      const d = new Date(date);
      previous = new Date(d.setHours(0, 0, 0, 0));
      current = new Date(d.setHours(23, 59, 59, 999));
    } else {
      ({ current, previous } = getDateRange(dateFilter));
    }
  
    // Get current and previous period metrics in parallel
    const [
      currentVendors,
      previousVendors,
      currentOrders,
      previousOrders
    ] = await Promise.all([
      Vendor.find({
        vendorType: VendorType.MARKET_SELLER,
        createdAt: { $lte: current }
      }),
      Vendor.find({
        vendorType: VendorType.MARKET_SELLER,
        createdAt: { $lte: previous }
      }),
      Order.find({ createdAt: { $lte: current } }),
      Order.find({ createdAt: { $lte: previous } })
    ]);
  
    const calculateStats = (vendors: any[], orders: any[]) => {
      const vendorOrders = new Map();
      orders.forEach(order => {
        const vendorId = order.vendorId ? order.vendorId.toString() : '';
        if (!vendorOrders.has(vendorId)) {
          vendorOrders.set(vendorId, []);
        }
        vendorOrders.get(vendorId).push(order);
      });
  
      return {
        totalVendors: vendors.length,
        newVendors: vendors.filter(v => 
          v.createdAt >= previous && v.createdAt <= current
        ).length,
        returningVendors: Array.from(vendorOrders.values())
          .filter(vendorOrders => vendorOrders.length > 1).length,
        activeVendors: vendorOrders.size
      };
    };
  
    const currentStats = calculateStats(currentVendors, currentOrders);
    const previousStats = calculateStats(previousVendors, previousOrders);
  
    return {
      totalVendors: {
        ...calculateMetrics(currentStats.totalVendors, previousStats.totalVendors, dateFilter),
        title: 'Total Vendors'
      },
      newVendors: {
        ...calculateMetrics(currentStats.newVendors, previousStats.newVendors, dateFilter),
        title: 'New Vendors'
      },
      returningVendors: {
        ...calculateMetrics(currentStats.returningVendors, previousStats.returningVendors, dateFilter),
        title: 'Returning Vendors'
      },
      activeVendors: {
        ...calculateMetrics(currentStats.activeVendors, previousStats.activeVendors, dateFilter),
        title: 'Active Vendors'
      }
    };
  }

  async getServiceProviderStats(date?: string, dateFilter: DateFilter = 'daily') {
    let current: Date, previous: Date;
    if (date) {
      const d = new Date(date);
      previous = new Date(d.setHours(0, 0, 0, 0));
      current = new Date(d.setHours(23, 59, 59, 999));
    } else {
      ({ current, previous } = getDateRange(dateFilter));
    }
  
    // Get current and previous period metrics in parallel
    const [
      currentProviders,
      previousProviders,
      currentBookings,
      previousBookings
    ] = await Promise.all([
      Vendor.find({
        vendorType: VendorType.SERVICE_PROVIDER,
        createdAt: { $lte: current }
      }),
      Vendor.find({
        vendorType: VendorType.SERVICE_PROVIDER,
        createdAt: { $lte: previous }
      }),
      Booking.find({ createdAt: { $lte: current } }),
      Booking.find({ createdAt: { $lte: previous } })
    ]);
  
    const calculateStats = (providers: any[], bookings: any[]) => {
      const providerBookings = new Map();
      bookings.forEach(booking => {
        const providerId = booking.providerId ? booking.providerId.toString() : '';
        if (!providerBookings.has(providerId)) {
          providerBookings.set(providerId, []);
        }
        providerBookings.get(providerId).push(booking);
      });
  
      return {
        totalProviders: providers.length,
        newProviders: providers.filter(v => 
          v.createdAt >= previous && v.createdAt <= current
        ).length,
        returningProviders: Array.from(providerBookings.values())
          .filter(bookingList => bookingList.length > 1).length,
        activeProviders: providerBookings.size
      };
    };
  
    const currentStats = calculateStats(currentProviders, currentBookings);
    const previousStats = calculateStats(previousProviders, previousBookings);
  
    return {
      totalServiceProviders: {
        ...calculateMetrics(currentStats.totalProviders, previousStats.totalProviders, dateFilter),
        title: 'Total Service Providers'
      },
      newProviders: {
        ...calculateMetrics(currentStats.newProviders, previousStats.newProviders, dateFilter),
        title: 'New Providers'
      },
      returningProviders: {
        ...calculateMetrics(currentStats.returningProviders, previousStats.returningProviders, dateFilter),
        title: 'Returning Providers'
      },
      activeProviders: {
        ...calculateMetrics(currentStats.activeProviders, previousStats.activeProviders, dateFilter),
        title: 'Active Providers'
      }
    };
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

  async getKYCStats(date?: string, dateFilter: DateFilter = 'daily') {
    let current: Date, previous: Date;
    if (date) {
      const d = new Date(date);
      previous = new Date(d.setHours(0, 0, 0, 0));
      current = new Date(d.setHours(23, 59, 59, 999));
    } else {
      ({ current, previous } = getDateRange(dateFilter));
    }
  
    // Get current and previous period metrics in parallel
    const [
      currentSubmissions,
      previousSubmissions
    ] = await Promise.all([
      Promise.all([
        BusinessInfo.countDocuments({ createdAt: { $lte: current } }),
        BusinessDetail.countDocuments({ createdAt: { $lte: current } }),
        CustomerCareDetail.countDocuments({ createdAt: { $lte: current } }),
        ShippingInfo.countDocuments({ createdAt: { $lte: current } }),
        PaymentInfo.countDocuments({ createdAt: { $lte: current } }),
        AdditionalInfo.countDocuments({ createdAt: { $lte: current } }),
        LegalRep.countDocuments({ createdAt: { $lte: current } }),
        MeansIdentification.countDocuments({ createdAt: { $lte: current } }),
        StoreFront.countDocuments({ createdAt: { $lte: current } })
      ]).then(results => results.reduce((a, b) => a + b, 0)),
      Promise.all([
        BusinessInfo.countDocuments({ createdAt: { $lte: previous } }),
        BusinessDetail.countDocuments({ createdAt: { $lte: previous } }),
        CustomerCareDetail.countDocuments({ createdAt: { $lte: previous } }),
        ShippingInfo.countDocuments({ createdAt: { $lte: previous } }),
        PaymentInfo.countDocuments({ createdAt: { $lte: previous } }),
        AdditionalInfo.countDocuments({ createdAt: { $lte: previous } }),
        LegalRep.countDocuments({ createdAt: { $lte: previous } }),
        MeansIdentification.countDocuments({ createdAt: { $lte: previous } }),
        StoreFront.countDocuments({ createdAt: { $lte: previous } })
      ]).then(results => results.reduce((a, b) => a + b, 0))
    ]);
  
    // Get KYC status countDocumentss for current period
    const [
      currentPending,
      currentApproved,
      currentRejected,
      previousPending,
      previousApproved,
      previousRejected
    ] = await Promise.all([
      // Current period status countDocumentss
      Promise.all([
        BusinessInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.PENDING }),
        BusinessDetail.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.PENDING }),
        CustomerCareDetail.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.PENDING }),
        ShippingInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.PENDING }),
        PaymentInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.PENDING }),
        AdditionalInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.PENDING }),
        LegalRep.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.PENDING }),
        MeansIdentification.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.PENDING }),
        StoreFront.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.PENDING })
      ]).then(results => results.reduce((a, b) => a + b, 0)),
      Promise.all([
        BusinessInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.APPROVED }),
        BusinessDetail.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.APPROVED }),
        CustomerCareDetail.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.APPROVED }),
        ShippingInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.APPROVED }),
        PaymentInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.APPROVED }),
        AdditionalInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.APPROVED }),
        LegalRep.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.APPROVED }),
        MeansIdentification.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.APPROVED }),
        StoreFront.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.APPROVED })
      ]).then(results => results.reduce((a, b) => a + b, 0)),
      Promise.all([
        BusinessInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.REJECTED }),
        BusinessDetail.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.REJECTED }),
        CustomerCareDetail.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.REJECTED }),
        ShippingInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.REJECTED }),
        PaymentInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.REJECTED }),
        AdditionalInfo.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.REJECTED }),
        LegalRep.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.REJECTED }),
        MeansIdentification.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.REJECTED }),
        StoreFront.countDocuments({ createdAt: { $lte: current }, status: KYCStatus.REJECTED })
      ]).then(results => results.reduce((a, b) => a + b, 0)),
      // Previous period status countDocumentss
      Promise.all([
        BusinessInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.PENDING }),
        BusinessDetail.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.PENDING }),
        CustomerCareDetail.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.PENDING }),
        ShippingInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.PENDING }),
        PaymentInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.PENDING }),
        AdditionalInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.PENDING }),
        LegalRep.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.PENDING }),
        MeansIdentification.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.PENDING }),
        StoreFront.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.PENDING })
      ]).then(results => results.reduce((a, b) => a + b, 0)),
      Promise.all([
        BusinessInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.APPROVED }),
        BusinessDetail.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.APPROVED }),
        CustomerCareDetail.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.APPROVED }),
        ShippingInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.APPROVED }),
        PaymentInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.APPROVED }),
        AdditionalInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.APPROVED }),
        LegalRep.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.APPROVED }),
        MeansIdentification.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.APPROVED }),
        StoreFront.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.APPROVED })
      ]).then(results => results.reduce((a, b) => a + b, 0)),
      Promise.all([
        BusinessInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.REJECTED }),
        BusinessDetail.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.REJECTED }),
        CustomerCareDetail.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.REJECTED }),
        ShippingInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.REJECTED }),
        PaymentInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.REJECTED }),
        AdditionalInfo.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.REJECTED }),
        LegalRep.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.REJECTED }),
        MeansIdentification.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.REJECTED }),
        StoreFront.countDocuments({ createdAt: { $lte: previous }, status: KYCStatus.REJECTED })
      ]).then(results => results.reduce((a, b) => a + b, 0))
    ]);
  
    return {
      totalSubmitted: {
        ...calculateMetrics(currentSubmissions, previousSubmissions, dateFilter),
        title: 'Total Submitted'
      },
      pendingKYC: {
        ...calculateMetrics(currentPending, previousPending, dateFilter),
        title: 'Pending KYC'
      },
      approvedKYC: {
        ...calculateMetrics(currentApproved, previousApproved, dateFilter),
        title: 'Approved KYC'
      },
      rejectedKYC: {
        ...calculateMetrics(currentRejected, previousRejected, dateFilter),
        title: 'Rejected KYC'
      }
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

  async updateKYCStatus(type: string, id: string, status: VendorStatus, rejectionMessage?: string, loggedAdmin: id) {
    let Model;

    let field;
    switch(type) {
      case 'businessInfo':
        Model = BusinessInfo;
        field = "businessInfoStatus";
        break;
      case 'businessDetail':
        Model = BusinessDetail;
        field = "businessDetailStatus";
        break;
      case 'customerCare':
        Model = CustomerCareDetail;
        field = "customerCareStatus";
        break;
      case 'shippingAddress':
        Model = ShippingInfo;
        field = "shippingInfoStatus";
        break;
      case 'paymentInfo':
        Model = PaymentInfo;
        field = "paymentInfoStatus";
        break;
      case 'additionalInfo':
        Model = AdditionalInfo;
        field = "additionalInfoStatus";
        break;
      case 'legalInfo':
        Model = LegalRep;
        field = "legalRepStatus";
        break;
      case 'identification':
        Model = MeansIdentification;
        field = "meansIdentificationStatus";
        break;
      case 'storefront':
        Model = StoreFront;
        field = "storeFrontStatus"
        break;
      default:
        throw new HttpError('Invalid KYC type', 400);
    }

    const doc = await Model.findOneAndUpdate(
      { vendorId: id },
      { status, rejectionMessage },
      { new: true }
    ).populate('vendorId');

    let kyc: KYClogsInterface = {
      vendorId: id,
      reviewedAt: new Date(),
      reviewedBy: loggedAdmin, 
    };

    kyc[field] = status == KYCStatus.APPROVED ? true : false;

    console.log(kyc);

    kyc = await this._kycLogsService().createKycLog(kyc);

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

  async createAdmin(adminData: {
    firstName: string;
    lastName: string;
    email: string;
    role: AdminRole;
  }) {
    // Generate a random password (12 characters)
    const generatePassword = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      const length = 12;
      let password = '';
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const password = generatePassword();

    // Create new admin
    const admin = new Admin({
      ...adminData,
      password,
      isActive: true
    });

    await admin.save();

    //send email to admin
    const email = admin.email;
    const subject = 'Admin Account Created';
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">Welcome to Admin Portal</h1>
          <p style="color: #34495e; font-size: 16px; line-height: 1.5;">Dear ${admin.firstName} ${admin.lastName},</p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.5;">Your admin account has been created successfully. Below are your login credentials:</p>
          
          <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e0e0e0;">
            <p style="margin: 5px 0; color:rgb(229, 136, 21);"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0; color:rgb(229, 136, 21);"><strong>Password:</strong> ${password}</p>
            <p style="margin: 5px 0; color:rgb(229, 136, 21);"><strong>Role:</strong> ${admin.role}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/login" 
               style="background-color:rgb(219, 149, 52); 
                      color: white; 
                      padding: 12px 25px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold;">
              Login to Admin Portal
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #7f8c8d; font-size: 14px;">For security reasons, we recommend changing your password after your first login.</p>
            <p style="color: #7f8c8d; font-size: 14px;">If you have any questions or need assistance, please contact the system administrator.</p>
          </div>
        </div>
      </div>
    `;

    axios
      .post("https://email-server-z0fz.onrender.com/send-email", {
        subject: "Admin Account Created",
        content: html,
        to: email,
      })
      .then(response => {
        console.log('Email sent successfully');
      })
      .catch(error => {
        console.error('Error sending email:', error);
      });

    // Return admin data with the generated password
    // Password should be sent to admin's email and not stored in plain text
    return {
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      },
      generatedPassword: password // This should be sent via email to the admin
    };
  }

  async getAllAdmins() {
    const admins = await Admin.find({}, {
      password: 0 // Exclude password field
    });

    return admins.map(admin => ({
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    }));
  }

  async updateAdmin(adminId: string, updateData: Partial<IAdmin>) {
    // Remove sensitive fields that shouldn't be updated directly
    const { password, ...safeUpdateData } = updateData;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new HttpError('Admin not found', 404);
    }

    // Update the admin document
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: safeUpdateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedAdmin) {
      throw new HttpError('Failed to update admin', 400);
    }

    return {
      id: updatedAdmin._id,
      firstName: updatedAdmin.firstName,
      lastName: updatedAdmin.lastName,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      isActive: updatedAdmin.isActive,
      lastLogin: updatedAdmin.lastLogin,
      createdAt: updatedAdmin.createdAt,
      updatedAt: updatedAdmin.updatedAt
    };
  }

  async deleteAdmin(adminId: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new HttpError('Admin not found', 404);
    }

    // Prevent deletion of the last super admin
    if (admin.role === AdminRole.SUPER_ADMIN) {
      const superAdminCount = await Admin.countDocuments({ 
        role: AdminRole.SUPER_ADMIN 
      });
      
      if (superAdminCount <= 1) {
        throw new HttpError(
          'Cannot delete the last super admin account', 
          400
        );
      }
    }

    await Admin.findByIdAndDelete(adminId);

    return {
      message: 'Admin deleted successfully'
    };
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

  async adminDashboardCards(date?: string, dateFilter: DateFilter = 'daily') {
    // let current: Date, previous: Date;
    // if (date) {
    //   current = new Date(date);
    //   previous = new Date(date);
    // } else {
    //   ({ current, previous } = getDateRange(dateFilter));
    // }
    return this._analytics.adminDashboardCards(date, dateFilter);
  }

  async adminDashboardServiceCards(date?: string, dateFilter: DateFilter = 'daily') {
    // let current: Date, previous: Date;
    // if (date) {
    //   current = new Date(date);
    //   previous = new Date(date);
    // } else {
    //   ({ current, previous } = getDateRange(dateFilter));
    // }
    return this._analytics.adminDashboardServiceCards(date,dateFilter);
  }

  async adminTransactionMetrics(date?: string, dateFilter: DateFilter = 'daily') {
    // let current: Date, previous: Date;
    // if (date) {
    //   current = new Date(date);
    //   previous = new Date(date);
    // } else {
    //   ({ current, previous } = getDateRange(dateFilter));
    // }
    return this._analytics.getTransactionMetrics(date, dateFilter);
  }

  async getAllTransactions(type: string) {
    return await Transaction.find({source: type}).populate("userId");
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


  async getMonthlyRevenueAndOrders() {
    // Initialize data structure for all months
    const months = [...Array(12)].map((_, i) => ({
      month: new Date(2023, i).toLocaleString('default', { month: 'short' }),
      revenue: 0,
      orders: 0
    }));

    // Get all orders for the current year
    const currentYear = new Date().getFullYear();

    const orders = await Order.find({
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

  // for tags
  async getAllTags() {
    return await Tags.find();
  }
  async createTag(tag: ITags) {
    let createdTag = await new Tags(tag).save();
    return createdTag;
  }

  async updateTag(tagId: string, tag: ITags) {
    let updatedTag = await Tags.findByIdAndUpdate(tagId, tag, { new: true });
    return updatedTag;
  }

  async deleteTag(tagId: string) {
    let deletedTag = await Tags.findByIdAndDelete(tagId);
    return deletedTag;
  };

  async getCustomerDashboardData(customerId: string, date?: string, dateFilter: DateFilter = 'daily') {
    let current: Date, previous: Date;
    if (date) {
      const d = new Date(date);
      previous = new Date(d.setHours(0, 0, 0, 0));
      current = new Date(d.setHours(23, 59, 59, 999));
    } else {
      ({ current, previous } = getDateRange(dateFilter));
    }

    // Get current and previous period metrics in parallel
    const [
      currentWallet,
      previousWallet,
      currentOrders,
      previousOrders,
      currentBookings,
      previousBookings,
      currentQuotes,
      previousQuotes
    ] = await Promise.all([
      Wallet.findOne({ userId: customerId, createdAt: { $lte: current } }),
      Wallet.findOne({ userId: customerId, createdAt: { $lte: previous } }),
      Order.find({ userId: customerId, createdAt: { $lte: current } }),
      Order.find({ userId: customerId, createdAt: { $lte: previous } }),
      Booking.find({ userId: customerId, createdAt: { $lte: current } }),
      Booking.find({ userId: customerId, createdAt: { $lte: previous } }),
      Quote.find({ userId: customerId, createdAt: { $lte: current }, status: 'completed' }),
      Quote.find({ userId: customerId, createdAt: { $lte: previous }, status: 'completed' })
    ]);

    const calculateStats = (orders: any[], bookings: any[], quotes: any[]) => ({
      totalOrders: orders.length,
      totalCompletedOrders: orders.filter(order => order.orderStatus === OrderStatus.PAID).length,
      totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      servicesRequested: bookings.length,
      completedServices: quotes.length
    });

    const currentStats = calculateStats(currentOrders, currentBookings, currentQuotes);
    const previousStats = calculateStats(previousOrders, previousBookings, previousQuotes);

    return {
      walletBalance: {
        ...calculateMetrics(currentWallet?.balance || 0, 0, dateFilter),
        title: 'Wallet Balance',
      },
      totalOrders: {
        ...calculateMetrics(currentStats.totalOrders, previousStats.totalOrders, dateFilter),
        title: 'Total Orders'
      },
      totalCompletedOrders: {
        ...calculateMetrics(currentStats.totalCompletedOrders, previousStats.totalCompletedOrders, dateFilter),
        title: 'Completed Orders'
      },
      servicesRequested: {
        ...calculateMetrics(currentStats.servicesRequested, previousStats.servicesRequested, dateFilter),
        title: 'Services Requested'
      }
    };
  }

  async getVendorDashboardData(vendorId: string, date?: string, dateFilter: DateFilter = 'daily') {
    let current: Date, previous: Date;
    if (date) {
      const d = new Date(date);
      previous = new Date(d.setHours(0, 0, 0, 0));
      current = new Date(d.setHours(23, 59, 59, 999));
    } else {
      ({ current, previous } = getDateRange(dateFilter));
    }

    // Get current and previous period metrics in parallel
    const [
      currentWallet,
      previousWallet,
      currentProducts,
      previousProducts,
      currentOrders,
      previousOrders
    ] = await Promise.all([
      Wallet.findOne({ vendorId, createdAt: { $lte: current } }),
      Wallet.findOne({ vendorId, createdAt: { $lte: previous } }),
      Product.find({ vendorId, createdAt: { $lte: current } }),
      Product.find({ vendorId, createdAt: { $lte: previous } }),
      Order.find({ vendorId, createdAt: { $lte: current } }),
      Order.find({ vendorId, createdAt: { $lte: previous } })
    ]);

    const calculateStats = (products: any[], orders: any[]) => ({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalCompletedOrders: orders.filter(order => order.orderStatus === OrderStatus.PAID).length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
    });

    const currentStats = calculateStats(currentProducts, currentOrders);
    const previousStats = calculateStats(previousProducts, previousOrders);

    return {
      walletBalance: {
        ...calculateMetrics(currentWallet?.balance || 0, previousWallet?.balance || 0, dateFilter),
        title: 'Wallet Balance'
      },
      totalProducts: {
        ...calculateMetrics(currentStats.totalProducts, previousStats.totalProducts, dateFilter),
        title: 'Listed Products'
      },
      totalOrders: {
        ...calculateMetrics(currentStats.totalOrders, previousStats.totalOrders, dateFilter),
        title: 'Total Orders'
      },
      totalCompletedOrders: {
        ...calculateMetrics(currentStats.totalCompletedOrders, previousStats.totalCompletedOrders, dateFilter),
        title: 'Completed Orders'
      },
      // totalRevenue: {
      //   ...calculateMetrics(currentStats.totalRevenue, previousStats.totalRevenue, dateFilter),
      //   title: 'Total Revenue'
      // }
    };
  }


  async getServiceProviderDashboardData(providerId: string, date?: string, dateFilter: DateFilter = 'daily') {
    let current: Date, previous: Date;
    if (date) {
      const d = new Date(date);
      previous = new Date(d.setHours(0, 0, 0, 0));
      current = new Date(d.setHours(23, 59, 59, 999));
    } else {
      ({ current, previous } = getDateRange(dateFilter));
    }

    // Get current and previous period metrics in parallel
    const [
      currentWallet,
      previousWallet,
      currentServices,
      previousServices,
      currentBookings,
      previousBookings,
      currentQuotes,
      previousQuotes
    ] = await Promise.all([
      // Current period
      Wallet.findOne({ vendorId: providerId }),
      // Previous period
      Wallet.findOne({ vendorId: providerId }),
      // Current period services
      Provide.find({ vendorId: providerId, createdAt: { $lte: current } }),
      // Previous period services
      Provide.find({ vendorId: providerId, createdAt: { $lte: previous } }),
      // Current period bookings
      Booking.find({ vendorId: providerId, createdAt: { $lte: current } }),
      // Previous period bookings
      Booking.find({ vendorId: providerId, createdAt: { $lte: previous } }),
      // Current period quotes
      Quote.find({ vendorId: providerId, createdAt: { $lte: current }, status: 'completed' }),
      // Previous period quotes
      Quote.find({ vendorId: providerId, createdAt: { $lte: previous }, status: 'completed' })
    ]);

    const calculateStats = (services: any[], bookings: any[], quotes: any[]) => ({
      totalServices: services.length,
      totalCompletedServices: quotes.length,
      servicesRequested: bookings.length
    });

    const currentStats = calculateStats(currentServices, currentBookings, currentQuotes);
    const previousStats = calculateStats(previousServices, previousBookings, previousQuotes);

    return {
      walletBalance: {
        ...calculateMetrics(currentWallet?.balance || 0, previousWallet?.balance || 0, dateFilter),
        title: 'Wallet Balance'
      },
      totalServices: {
        ...calculateMetrics(currentStats.totalServices, previousStats.totalServices, dateFilter),
        title: 'Total Services'
      },
      totalCompletedServices: {
        ...calculateMetrics(currentStats.totalCompletedServices, previousStats.totalCompletedServices, dateFilter),
        title: 'Completed Services'
      },
      servicesRequested: {
        ...calculateMetrics(currentStats.servicesRequested, previousStats.servicesRequested, dateFilter),
        title: 'Services Requested'
      }
    };
  }

  async deleteOrder(orderId: string) {
    return await Order.findByIdAndDelete(orderId);
  };

  async deleteVendor(vendorId: string) {
    return await Vendor.findByIdAndDelete(vendorId);
  };

  async editUser(userId: string, data: any) {
    return await User.findByIdAndUpdate(userId, data, { new: true });
  };

}

export default AdminService;
