/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import ReviewService from '@services/review.service';
import { ReviewInterface } from '@interfaces/Review.Interface';
import Controller from '@controllers/controller';
import { UserRole } from '@interfaces/User.Interface';
// import { ReviewResponseDTO } from '@dtos/Review.dto';

class ReviewController extends Controller<ReviewInterface> {
  service = new ReviewService();
  responseDTO = undefined; // ReviewResponseDTO.Review;

  getByUser = this.control((req: Request) => {
    const data = {};
    if (req.user && req.user?.role !== UserRole.ADMIN) {
      Object.assign(data, { userId: req.user?._id });
    }
    return this.service.find(data, {
      multiPopulate: [
        {
          path: 'userId',
          model: 'User',
          select: 'firstName lastName avatar',
        },

        {
          path: 'serviceId',
          model: 'Service',
          select: 'name providerId',
          populate: {
            path: 'providerId',
            model: 'User',
            select: 'firstName lastName avatar',
          },
        },
      ],
    });
  });

  getAll = this.control((req: Request) => {
    const data = { serviceId: { $ne: null } } as any;

    return this.service.find(data, {
      multiPopulate: [
        {
          path: 'userId',
          model: 'User',
          select: 'firstName lastName avatar',
        },

        {
          path: 'serviceId',
          model: 'Service',
          select: 'name vendorId',
          populate: {
            path: 'vendorId',
            model: 'User',
            select: 'firstname lastname',
          },
        },
      ],
    });
  });

  rate = this.control(async (req: Request) => {
    const data = { userId: req.user?._id };

    if (req.body.productId) {
      Object.assign(data, { productId: req.body.productId });
    }
    if (req.body.serviceId) {
      Object.assign(data, { serviceId: req.body.serviceId });
    }
    if (req.body.rating) {
      Object.assign(data, { rating: req.body.rating });
    }
    if (req.body.comment) {
      Object.assign(data, { comment: req.body.comment });
    }

    const result = await this.service.rate(data);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  rateService = this.control(async (req: Request) => {
    const data = { userId: req.user?._id, ...req.body };

  

    const result = await this.service.rateService(data);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  rateProduct = this.control(async (req: Request) => {
    const data = { userId: req.user?._id, ...req.body };

  

    const result = await this.service.rateProduct(data);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getByProduct = this.control(async (req: Request) => {
    const result = await this.service.find(
      { productId: req.params.productId },
      {
        multiPopulate: [
          {
            path: 'userId',
            model: 'User',
            select: 'firstName lastName avatar',
          },
          {
            path: 'productId',
            model: 'Product',
            select: 'name',
            populate: {
              path: 'vendor',
              model: 'Vendor',
              select: 'firstname lastname',
            },
          },
        ],
      },
    );
    return result;
  });

  getByService = this.control(async (req: Request) => {
    const result = await this.service.find(
      { serviceId: req.params.serviceId },

      {
        multiPopulate: [
          {
            path: 'userId',
            model: 'User',
            select: 'firstName lastName avatar',
          },
          {
            path: 'serviceId',
            model: 'Service',
            select: 'name',
            populate: {
              path: 'vendorId',
              model: 'Vendor',
              select: 'firstname lastname',
            },
          },
        ],
      },
    );
    return result;
  });
}

export default ReviewController;
