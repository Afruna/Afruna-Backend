/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import { LegalRepInterface } from '@interfaces/Legal.Rep.Interface';
import LegalRepService from '@services/legal.rep.service';
// import { ProductResponseDTO } from '@dtos/product.dto';

class LegalRepController extends Controller<LegalRepInterface> {
  service = new LegalRepService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let legalRep = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!legalRep)
      legalRep = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      legalRep = await this.service.update({ _id: legalRep._id}, data)

    return legalRep;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default LegalRepController;
