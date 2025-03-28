/* eslint-disable import/no-unresolved */
import TransactionController from '@controllers/transaction.controller';
import { transactionRequestDTO } from '@dtos/transaction.dto';
import Route from '@routes/route';
import { TransactionInterface } from '@interfaces/Transaction.Interface';

export default class TransactionRoute extends Route<TransactionInterface> {
  controller = new TransactionController('transaction');
  dto = transactionRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get(this.authorize(), this.controller.get)
      .post(this.authorize(), this.validator(this.dto.init), this.controller.init);
    this.router.route('/service').post(this.authorize(), this.validator(this.dto.service), this.controller.initService);
    this.router.route('/:transactionId').get(this.authorize(), this.controller.getOne);
    this.router.route('/webhook/validate').post(this.controller.webhook);
    this.router.route('/verify/callback').get(this.controller.callbackHandler);

    return this.router;
  }
}
