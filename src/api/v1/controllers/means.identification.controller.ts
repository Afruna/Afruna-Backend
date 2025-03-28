/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import MeansIdentificationService from '@services/means.identification.service';
import { MeansIdentificationInterface } from '@interfaces/Means.Identification.Interface';
// import { ProductResponseDTO } from '@dtos/product.dto';

class MeansIdentificationController extends Controller<MeansIdentificationInterface> {
  service = new MeansIdentificationService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let meansIdentification = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!meansIdentification)
      meansIdentification = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      meansIdentification = await this.service.update({ _id: meansIdentification._id}, data)

    return meansIdentification;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default MeansIdentificationController;
