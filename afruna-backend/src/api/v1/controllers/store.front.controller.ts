/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import StoreFrontService from '@services/store.front.service';
import { StoreFrontInterface } from '@interfaces/Store.Front.Interface';
// import { ProductResponseDTO } from '@dtos/product.dto';

class StoreFrontController extends Controller<StoreFrontInterface> {
  service = new StoreFrontService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let storeFront = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!storeFront)
      storeFront = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      storeFront = await this.service.update({ _id: storeFront._id}, data)

    return storeFront;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default StoreFrontController;
