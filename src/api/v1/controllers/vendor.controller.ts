/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import { VendorInterface } from '@interfaces/Vendor.Interface';
import VendorService from '@services/vendor.service';
import { VendorResponseDTO } from '@dtos/vendor.dto';
import { stringToEnum } from '@utils/delivery.compute';
class VendorController extends Controller<VendorInterface> {
  service = new VendorService();
  responseDTO = VendorResponseDTO;

  getVendors = this.control(async (req: Request) => {
    const result = await this.service.getVendors();
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getServiceProvider = this.control(async (req: Request) => {
    const result = await this.service.getServiceProvider();
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getFeatured = this.control(async (req: Request) => {
    const result = await this.service.getFeatured(stringToEnum(<string>req.query.type));

    return result;
  });

  getPopularServiceProvider = this.control(async (req: Request) => {
    const result = await this.service.getPopularServiceProvider();

    return result;
  });

  toggleFollow = this.control(async (req: Request) => {
    const result = await this.service.toggleFollow(req.vendor?._id, req.body.userId);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  
  getFollowing = this.control(async (req: Request) => {
    const result = await this.service.getFollow(
      req.vendor?._id,
      false,
      (req.query.page as unknown as number) || 1,
      (req.query.limit as unknown as number) || 10,
    );
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getMarketSellerDashboardStats = this.control(async (req: Request) => {
    const result = await this.service.getMarketSellerDashboardStats(req.vendor._id);

    return result;
  });

  getServiceProviderDashboardStats = this.control(async (req: Request) => {
    const result = await this.service.getServiceProviderDashboardStats(req.vendor._id);

    return result;
  });

  getOne = this.control(async (req: Request) => {
    const result = await this.service.getOne(req.params[this.resourceId]);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;

  });


  update = this.control(async (req: Request) => {
    this.processFile(req);
    const params = req.params[this.resourceId];
    const data = <VendorInterface>req.body;
    const result = await this.service.update(params, data);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  delete = this.control(async (req: Request) => {
    const params = req.params[this.resourceId];

    const result = await this.service.delete(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

}

export default VendorController;
