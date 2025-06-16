import Route from '@routes/route';
import PayoutController from '@controllers/payout.controller';
import { payoutRequestDTO } from '@dtos/payout.dto';
import { PayoutInterface } from '@interfaces/Payout.Interface';
import { authorizeVendor } from '@middlewares/jwt';

export default class PayoutRoute extends Route<PayoutInterface> {
  controller = new PayoutController('payout');
  dto = payoutRequestDTO;

  initRoutes() {
    // Vendor routes
    this.router
      .route('/request')
      .post(authorizeVendor(), this.validator(this.dto.request), this.controller.requestPayout);

    this.router
      .route('/vendor')
      .get(authorizeVendor(), this.controller.getVendorPayouts);

    // Admin routes
    this.router
      .route('/pending')
      .get(this.authorize('admin'), this.controller.getPendingPayouts);

    this.router
      .route('/bulk')
      .post(this.authorize('admin'), this.validator(this.dto.bulk), this.controller.bulkPayout);

    this.router
      .route('/:payoutId/approve')
      .post(this.authorize('admin'), this.controller.approvePayout);

    this.router
      .route('/:payoutId/reject')
      .post(this.authorize('admin'), this.validator(this.dto.reject), this.controller.rejectPayout);

    this.router
      .route('/:payoutId')
      .get(this.authorize(), this.controller.getPayoutDetails);

    return this.router;
  }
} 