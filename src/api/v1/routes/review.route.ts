/* eslint-disable import/no-unresolved */
import ReviewController from '@controllers/review.controller';
import { reviewRequestDTO } from '@dtos/review.dto';
import Route from '@routes/route';
import { ReviewInterface } from '@interfaces/Review.Interface';

export default class ReviewRoute extends Route<ReviewInterface> {
  controller = new ReviewController('review');
  dto = reviewRequestDTO;
  initRoutes() {
    this.router.post('/', this.authorize(), this.validator(this.dto.rate), this.controller.rate);
    this.router.post('/rate-service', this.authorize(), this.validator(this.dto.rateService), this.controller.rateService);
    this.router.post('/rate-product', this.authorize(), this.validator(this.dto.rateService), this.controller.rateProduct);
    this.router.get('/', this.authorize(), this.controller.getByUser);
    this.router.get('/all', this.controller.getAll);
    this.router.get('/:productId', this.validator(this.dto.productId), this.controller.getByProduct);
    this.router.get('/:serviceId/service', this.validator(this.dto.serviceId), this.controller.getByService);

    return this.router;
  }
}
