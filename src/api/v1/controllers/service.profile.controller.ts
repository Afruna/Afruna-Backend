/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import { ServiceProfileInterface } from '@interfaces/Service.Profile.Interface';
import ServiceProfileService from '@services/service,profile.service';
import AdditionalInfoController from './additional.info.controller';
// import { ProductResponseDTO } from '@dtos/product.dto';

class ServiceProfileController extends Controller<ServiceProfileInterface> {
  service = new ServiceProfileService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let serviceProfile = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!serviceProfile)
      serviceProfile = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
    serviceProfile = await this.service.update({ _id: serviceProfile._id}, data)

    return serviceProfile;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default ServiceProfileController;
