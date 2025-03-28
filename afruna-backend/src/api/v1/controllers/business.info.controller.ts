/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import { BusinessInfoInterface } from '@interfaces/Business.Info.Interface';
import BusinessInfoService from '@services/business.info.service';
// import { ProductResponseDTO } from '@dtos/product.dto';

class BusinessInfoController extends Controller<BusinessInfoInterface> {
  service = new BusinessInfoService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let businessInfo = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!businessInfo)
      businessInfo = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      businessInfo = await this.service.update({ _id: businessInfo._id}, data)

    return businessInfo;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default BusinessInfoController;
