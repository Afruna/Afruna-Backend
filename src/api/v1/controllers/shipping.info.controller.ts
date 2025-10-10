/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import ShippingInfoService from '@services/shipping.info.service';
import { ShippingInfoInterface } from '@interfaces/Shipping.Info.Interface';
// import { ProductResponseDTO } from '@dtos/product.dto';

class ShippingInfoController extends Controller<ShippingInfoInterface> {
  service = new ShippingInfoService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let shippingInfo = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!shippingInfo)
      shippingInfo = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      shippingInfo = await this.service.update({ _id: shippingInfo._id}, data)

    return shippingInfo;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });
  
}

export default ShippingInfoController;
