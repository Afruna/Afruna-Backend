/* eslint-disable import/no-unresolved */
import QuoteController from '@controllers/quote.controller';
import Route from '@routes/route';
import { QuoteInterface } from '@interfaces/Quote.Interface';
import { authorize } from '@middlewares/jwt';
import { quoteRequestDTO } from '@dtos/quote.dto';

export default class QuoteRoute extends Route<QuoteInterface> {
  dto = quoteRequestDTO;
  controller = new QuoteController('quote');
  initRoutes() {
    this.router.route('/')
    .get(this.authorizeVendor(), this.controller.get)
    .post(this.authorizeVendor(), this.validator(this.dto.create), this.controller.createQuote);

    this.router
      .route('/:quoteId')
      .put(this.authorizeVendor(), this.validator(this.dto.update), this.controller.update)
      .delete(this.authorizeVendor(), this.validator(this.dto.id), this.controller.delete);

    this.router.route('/user')
    .get(this.authorize(), this.controller.findAllByUser);


    this.router.route('/vendor')
    .get(this.authorizeVendor(), this.controller.findAllByVendor);

    return this.router;
  }
}
