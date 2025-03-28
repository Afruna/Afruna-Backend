/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import BusinessAddressService from '@services/business.address.service';
import { BusinessAddressInterface } from '@interfaces/Business.Address.Interface';
// import { ProductResponseDTO } from '@dtos/product.dto';

class BusinessAddressController extends Controller<BusinessAddressInterface> {
  service = new BusinessAddressService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let businessAddress = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!businessAddress)
      businessAddress = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      businessAddress = await this.service.update({ _id: businessAddress._id}, data)

    return businessAddress;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default BusinessAddressController;
