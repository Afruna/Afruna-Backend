/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import PaymentInfoService from '@services/payment.info.service';
import { PaymentInfoInterface } from '@interfaces/PaymentInfo.Interface';

class PaymentInfoController extends Controller<PaymentInfoInterface> {
  service = new PaymentInfoService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  create = this.control(async(req: Request) => {
    const data = req.body;
    let paymentInfo = await this.service.getByVendorId(req.vendor?._id.toString());

    if(!paymentInfo)
      paymentInfo = await this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
    else
      paymentInfo = await this.service.update({ _id: paymentInfo._id}, data)

    return paymentInfo;
  });


  getByVendorId = this.control((req: Request) => {
    return this.service.getByVendorId(req.vendor?._id.toString());
  });

  
}

export default PaymentInfoController;
