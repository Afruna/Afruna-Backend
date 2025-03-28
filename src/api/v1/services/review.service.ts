import HttpError from '@helpers/HttpError';
import { ReviewInterface } from '@interfaces/Review.Interface';
import ReviewRepository from '@repositories/Review.repo';
import Service from '@services/service';
import ProductService from './product.service';
import ProvideService from './provide.service';
// import { logger } from '@utils/logger';
// import s3 from '@helpers/multer';
// import { OPTIONS } from '@config';

class ReviewService extends Service<ReviewInterface, ReviewRepository> {
  protected repository = new ReviewRepository();
  protected readonly _productService = ProductService.instance;
  protected readonly _provideService = ProvideService.instance;
  private static _instance: ReviewService;

  async rate({
    vendorId,
    productId,
    serviceId,
    rating,
    comment,
  }: {
    vendorId: string;
    serviceId?: string;
    productId?: string;
    rating?: number;
    comment?: string;
  }) {
    if (productId) {
      const product = await this._productService().findOne(productId);
      if (!product) throw new HttpError('invalid product', 404);
      if (rating) {
        const newRating = (product?.ratings * product.ratedBy + rating) / (product.ratedBy + 1);
        await this._productService().update(productId, {
          ratedBy: product.ratedBy + 1,
          ratings: +newRating.toFixed(1),
        });
      }
      return this.update({ vendorId, productId }, { vendorId, productId, rating, comment }, true);
    } else if (serviceId) {
      const service = await this._provideService().findOne(serviceId);
      if (!service) throw new HttpError('invalid service', 404);
      if (rating) {
        const newRating = (service?.ratings * service.ratedBy + rating) / (service.ratedBy + 1);
        await this._provideService().update(serviceId, {
          ratedBy: service.ratedBy + 1,
          ratings: +newRating.toFixed(1),
        });
      }
      return this.update({ vendorId, serviceId }, { vendorId, serviceId, rating, comment }, true);
    }
  }

  async rateService(data: {
    userId: string;
    serviceId?: string;
    rating?: number;
    comment?: string;
  }) {
    return await this.create(data)
  }

  async rateProduct(data: {
    userId: string;
    productId?: string;
    rating?: number;
    comment?: string;
  }) {
    return await this.create(data)
  }

  static instance() {
    if (!ReviewService._instance) {
      ReviewService._instance = new ReviewService();
    }
    return ReviewService._instance;
  }
}

export default ReviewService;
