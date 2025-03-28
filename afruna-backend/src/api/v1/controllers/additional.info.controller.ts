/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import AdditionalInfoService from '@services/additional.info.service';
import { AdditionalInfoInterface } from '@interfaces/Additional.Info.Interface';
// import { ProductResponseDTO } from '@dtos/product.dto';

class AdditionalInfoController extends Controller<AdditionalInfoInterface> {
  service = new AdditionalInfoService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let additionalInfo = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!additionalInfo)
      additionalInfo = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      additionalInfo = await this.service.update({ _id: additionalInfo._id}, data)

    return additionalInfo;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default AdditionalInfoController;
