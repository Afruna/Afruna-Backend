/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import AddressService from '@services/address.service';
import { AddressInterface } from '@interfaces/Address.Interface';
// import { ProductResponseDTO } from '@dtos/product.dto';

class AddressController extends Controller<AddressInterface> {
  service = new AddressService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control((req: Request) => {
    const data = req.body;

   this.service.update(
      { userId: req.user?._id.toString() },
      {
        load: { key: 'isDefault', value: false }
      })

    return this.service.create({ ...data, isDefault: true, userId: req.user?._id.toString() });
  });


  getByUserId = this.control((req: Request) => {
    return this.service.getAddressByUserId(req.user?._id.toString());
  });


  setAsDefault = this.control((req: Request) => {
    return this.service.setAsDefault(req.user?._id.toString(), req.params.addressId);
  });

  removeAddress = this.control((req: Request) => {
    return this.service.remove(req.params.addressId);
  });
  
}

export default AddressController;
