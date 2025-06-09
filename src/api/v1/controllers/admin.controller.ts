/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import { UserInterface } from '@interfaces/User.Interface';
import Controller from '@controllers/controller';
import { UserResponseDTO } from '@dtos/user.dto';
import AdminService from '@services/admin.service';
import { AuthResponseDTO } from '@dtos/auth.dto';
import User from '@models/User';

class AdminController extends Controller<UserInterface> {
  service = new AdminService();
  responseDTO = UserResponseDTO.User;

  login = this.control(async (req: Request) => {
    return this.service.signIn(req.body);
  }, AuthResponseDTO.adminLogin);

  adminRevenueOrderTable = this.control(async (req: Request) => {
    const result = await this.service.adminRevenueOrderTable(<any>req.query.time);

    return result;
  });
  adminDashboardCards = this.control(async (req: Request) => {
    const result = await this.service.adminDashboardCards(<any>req.query.dateFilter);
    return result;
  });
  salesByCategory = this.control(async (req: Request) => {
    const result = await this.service.salesByCategory();

    return result;
  });

  bookingSummary = this.control(async (req: Request) => {
    const result = await this.service.bookingSummary(req.query.startDate as string, req.query.endDate as string);

    return result;
  });

  bookingStatistics = this.control(async (req: Request) => {
    const result = await this.service.bookingStatistics();

    return result;
  });

  userGrowth = this.control(async (req: Request) => {
    const result = await this.service.userGrowth(<string>req.query.startDate, <string>req.query.endDate);

    return result;
  });

  topSellingProduct = this.control(async (req: Request) => {
    const result = await this.service.topSellingProduct();

    return result;
  });

  adminVendorCards = this.control(async (req: Request) => {
    const result = await this.service.adminVendorCards();

    return result;
  });

  orderCards = this.control(async (req: Request) => {
    const result = await this.service.orderCards();

    return result;
  });

  userCards = this.control(async (req: Request) => {
    const result = await this.service.userCards();

    return result;
  });

  block = this.control(async (req: Request) => {
    const result = await this.service.block(req.params.userId);

    return result;
  });
  reviews = this.control(async (req: Request) => {
    const result = await this.service.reviews();

    return result;
  });

  hype = this.control(async (req: Request) => {
    const result = await this.service.hype(req.params.productId);

    return result;
  });

  blockProduct = this.control(async (req: Request) => {
    const result = await this.service.blockProduct(req.params.productId);

    return result;
  });

  getProvider = this.control(async (req: Request) => {
    const result = await this.service.getProviders(this.safeQuery(req));
    return result;
  });

  getVendors = this.control(async (req: Request) => {
    const result = await this.service.getVendors();
    return result;
  });

  getCustomers = this.control(async (req: Request) => {
    const result = await User.find()
    return result;
  });

  getCustomerById = this.control(async (req: Request) => {
    const result = await this.service.getCustomerById(req.params.userId);
    return result;
  });

  getBookingsProvider = this.control(async (req: Request) => {
    const result = await this.service.getBookings(this.safeQuery(req), req.params.userId, true);
    return result;
  });

  getBookingsCustomer = this.control(async (req: Request) => {
    const result = await this.service.getBookings(this.safeQuery(req), req.params.userId, false);
    return result;
  });

  updateServiceStatus = this.control(async (req: Request) => {
    const result = await this.service.updateServiceStatus(req.params.serviceId, req.body.status);

    return result;
  });

  blockService = this.control(async (req: Request) => {
    const result = await this.service.blockService(req.params.serviceId);

    return result;
  });

  adminDashboardServiceCards = this.control(async (req: Request) => {
    const result = await this.service.adminDashboardServiceCards(<any>req.query.dateFilter);

    return result;
  });

  adminTransactionMetrics = this.control(async (req: Request) => {
    const result = await this.service.adminTransactionMetrics(<any>req.query.dateFilter);

    return result;
  });

  getAllTransactions = this.control(async (req: Request) => {
    const result = await this.service.getAllTransactions();

    return result;
  });

  topService = this.control(async (req: Request) => {
    const result = await this.service.topService();

    return result;
  });

  topProvider = this.control(async (req: Request) => {
    const result = await this.service.topProvider();

    return result;
  });

  getAllProviders = this.control(async (req: Request) => {
    const result = await this.service.findAllProvider();

    return result;
  });

  getAllOrders = this.control(async (req: Request) => {
    const result = await this.service.findAllOrders();

    return result;
  });

  getOrderById = this.control(async (req: Request) => {
    const result = await this.service.findOrderById(req.params.orderId);

    return result;
  });

  getOrdersByUserId = this.control(async (req: Request) => {
    const result = await this.service.findOrdersByUserId(req.params.userId);

    return result;
  });

  getOrdersByVendorId = this.control(async (req: Request) => {
    const result = await this.service.findOrdersByVendorId(req.params.vendorId);

    return result;
  });

  getVendorBusinessInformation = this.control(async (req: Request) => {
    const result = await this.service.getVendorBusinessInformation(req.params.vendorId);

    return result;
  });

  getVendorBusinessDetails = this.control(async (req: Request) => {
    const result = await this.service.getVendorBusinessDetails(req.params.vendorId);

    return result;
  });

  getVendorCustomerCareInformation = this.control(async (req: Request) => {
    const result = await this.service.getVendorCustomerCareInformation(req.params.vendorId);

    return result;
  });

  getVendorAddressInformation = this.control(async (req: Request) => {
    const result = await this.service.getVendorAddressInformation(req.params.vendorId);

    return result;
  });

  getVendorPaymentInformation = this.control(async (req: Request) => {
    const result = await this.service.getVendorPaymentInformation(req.params.vendorId);

    return result;
  });

  getAdditionalInformation = this.control(async (req: Request) => {
    const result = await this.service.getAdditionalInformation(req.params.vendorId);

    return result;
  }); 

  getProviderLegalInformation = this.control(async (req: Request) => {
    const result = await this.service.getProviderLegalInformation(req.params.vendorId);

    return result;
  });

  getProviderMeansOfIdentification = this.control(async (req: Request) => {
    const result = await this.service.getProviderMeansOfIdentification(req.params.vendorId);

    return result;
  });

  getStoreFront = this.control(async (req: Request) => {
    const result = await this.service.getStoreFront(req.params.vendorId);

    return result;
  });

  getKYCLogs = this.control(async (req: Request) => {
    const result = await this.service.getKYCLogs(req.params.vendorId);

    return result;
  });
  
  getKYCLogById = this.control(async (req: Request) => {
    const result = await this.service.getKYCLogById(req.params.logId);

    return result;
  });

  createKYCLog = this.control(async (req: Request) => {
    const result = await this.service.createKYCLog(req.body);

    return result;
  });

  updateKYCLog = this.control(async (req: Request) => {
    const result = await this.service.updateKYCLog(req.params.logId, req.body);

    return result;
  });

  getAllKYCLogs = this.control(async (req: Request) => {
    const result = await this.service.getAllKYCLogs();

    return result;
  });

  getAllSubmittedKYC = this.control(async (req: Request) => {
    const result = await this.service.getAllSubmittedKYC();

    return result;
  });

  getAllVendorKYCDetails = this.control(async (req: Request) => {
    const result = await this.service.getAllVendorKYCDetails(req.params.vendorId);

    return result;
  });

  
  updateKYCStatus = this.control(async (req: Request) => {
    const result = await this.service.updateKYCStatus(req.body.type, req.body.vendorId, req.body.status, req.body.rejectionMessage, req.user);

    return result;
  });

  createSpecialOffer = this.control(async (req: Request) => {
    const result = await this.service.createSpecialOffer(req.body);

    return result;
  });

  getAllSpecialOffers = this.control(async (req: Request) => {
    const result = await this.service.getAllSpecialOffers();

    return result;
  });

  getSpecialOfferById = this.control(async (req: Request) => {
    const result = await this.service.getSpecialOfferById(req.params.id);

    return result;
  });

  updateSpecialOffer = this.control(async (req: Request) => {
    const result = await this.service.updateSpecialOffer(req.params.id, req.body);

    return result;
  });

  deleteSpecialOffer = this.control(async (req: Request) => {
    const result = await this.service.deleteSpecialOffer(req.params.id);

    return result;
  });

  getKYCStats = this.control(async (req: Request) => {
    const result = await this.service.getKYCStats(<any>req.query.dateFilter);

    return result;
  });

  getProductStats = this.control(async (req: Request) => {
    const result = await this.service.getProductStats(<any>req.query.dateFilter);

    return result;
  });

  getOrderStats = this.control(async (req: Request) => {
    const result = await this.service.getOrderStats(<any>req.query.dateFilter);

    return result;
  });

  getCustomerStats = this.control(async (req: Request) => {
    const result = await this.service.getCustomerStats(<any>req.query.dateFilter);

    return result;
  });

  getVendorStats = this.control(async (req: Request) => {
    const result = await this.service.getVendorStats(<any>req.query.dateFilter);

    return result;
  });

  getServiceProviderStats = this.control(async (req: Request) => {
    const result = await this.service.getServiceProviderStats(<any>req.query.dateFilter);

    return result;
  });

  createAdmin = this.control(async (req: Request) => {
    const result = await this.service.createAdmin(req.body);

    return result;
  });

  getAllAdmins = this.control(async (req: Request) => {
    const result = await this.service.getAllAdmins();

    return result;
  });   

  updateAdmin = this.control(async (req: Request) => {
    const result = await this.service.updateAdmin(req.params.adminId, req.body);

    return result;
  });

  deleteAdmin = this.control(async (req: Request) => {
    const result = await this.service.deleteAdmin(req.params.adminId);

    return result;
  }); 
  
  getMonthlyRevenueAndOrders = this.control(async (req: Request) => {
    const result = await this.service.getMonthlyRevenueAndOrders();

    return result;
  });

  createTag = this.control(async (req: Request) => {
    const result = await this.service.createTag(req.body);
    return result;
  });
  
  updateTag = this.control(async (req: Request) => {
    const result = await this.service.updateTag(req.params.tagId, req.body);
    return result;
  });

  deleteTag = this.control(async (req: Request) => {
    const result = await this.service.deleteTag(req.params.tagId);
    return result;
  });

  getAllTags = this.control(async (req: Request) => {
    const result = await this.service.getAllTags();
    return result;
  }); 

  getCustomerDashboardData = this.control(async (req: Request) => {
    const result = await this.service.getCustomerDashboardData(req.params.userId);
    return result;
  });

  getServiceProviderDashboardData = this.control(async (req: Request) => {
    const result = await this.service.getServiceProviderDashboardData(req.params.providerId, <any>req.query.dateFilter);
    return result;
  });

  deleteOrder = this.control(async (req: Request) => {
    const result = await this.service.deleteOrder(req.params.orderId);
    return result;
  });

  deleteVendor = this.control(async (req: Request) => {
    const result = await this.service.deleteVendor(req.params.vendorId);
    return result;
  });
  
}

export default AdminController;
