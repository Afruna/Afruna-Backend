/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import ReturnAddressService from '@services/return.address.service';
import { ReturnAddressInterface } from '@interfaces/Return.Address.Interface';
// import { ProductResponseDTO } from '@dtos/product.dto';

class ReturnAddressController extends Controller<ReturnAddressInterface> {
  service = new ReturnAddressService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let returnAddress = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!returnAddress)
      returnAddress = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      returnAddress = await this.service.update({ _id: returnAddress._id}, data)

    return returnAddress;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default ReturnAddressController;
