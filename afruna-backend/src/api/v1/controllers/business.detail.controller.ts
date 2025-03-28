/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import { BusinessDetailInterface } from '@interfaces/Business.Detail.Interface';
import BusinessDetailService from '@services/business.detail.service';
import BusinessInfoController from './business.info.controller';

class BusinessDetailController extends Controller<BusinessDetailInterface> {
  service = new BusinessDetailService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let businessDetail = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!businessDetail)
      businessDetail = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      businessDetail = await this.service.update({ _id: businessDetail._id}, data)

    return businessDetail;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default BusinessDetailController;
