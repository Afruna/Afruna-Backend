/* eslint-disable import/no-unresolved */
import PaymentInfoController from '@controllers/payment.info.controller';
import { paymentInfoRequestDto } from '@dtos/payment.info.dto';
import { PaymentInfoInterface } from '@interfaces/PaymentInfo.Interface';
import Route from '@routes/route';

class PaymentInfoRoute extends Route<PaymentInfoInterface> {
  controller = new PaymentInfoController('paymentInfo');
  dto = paymentInfoRequestDto;
  initRoutes() {
    this.router
      .route('/')
      .get(this.authorizeVendor(), this.controller.getByVendorId)
      .post(
        this.authorizeVendor(),
        this.validator(this.dto.create),
        this.controller.create,
      );

    this.router
      .route('/:businessInfoId')
      .put(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default PaymentInfoRoute;
