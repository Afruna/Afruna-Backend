/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import BusinessDetailController from './business.detail.controller';
import { CustomerCareDetailInterface } from '@interfaces/CustomerCare.Detail.Interface';
import CustomerCareDetailService from '@services/customer-care.detail.service';

class CustomerCareDetailController extends Controller<CustomerCareDetailInterface> {
  service = new CustomerCareDetailService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let customerCareDetail = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!customerCareDetail)
      customerCareDetail = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      customerCareDetail = await this.service.update({ _id: customerCareDetail._id}, data)

    return customerCareDetail;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default CustomerCareDetailController;
