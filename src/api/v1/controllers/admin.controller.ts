/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import { UserInterface } from '@interfaces/User.Interface';
import Controller from '@controllers/controller';
import { UserResponseDTO } from '@dtos/user.dto';
import AdminService from '@services/admin.service';
import { AuthResponseDTO } from '@dtos/auth.dto';

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
    const result = await this.service.adminDashboardCards();
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
    const result = await this.service.getCustomers(this.safeQuery(req));
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
    const result = await this.service.adminDashboardServiceCards();

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
}

export default AdminController;
