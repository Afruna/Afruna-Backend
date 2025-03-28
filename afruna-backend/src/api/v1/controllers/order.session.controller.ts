/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import { Types } from 'mongoose';
import OrderService from '@services/order.service';
import { OrderInterface, OrderSessionInterface } from '@interfaces/Order.Interface';
import Controller from '@controllers/controller';
import { UserRole } from '@interfaces/User.Interface';
import Service from '@services/service';
// import { OrderResponseDTO } from '@dtos/Order.dto';

class OrderSessionController extends Controller<OrderSessionInterface> {
  //service = new OrderSessionService();
  service: = undefined;
  responseDTO = undefined; // OrderResponseDTO.Order;

  

  get = this.control(async (req: Request) => {
    let result;
    const role = req.user?.role;

    console.log("User", req.user);

    if (role === UserRole.USER) {
      result = await this.service.paginatedFind({ userId: req.user?._id }, {}, [
        { path: 'vendorId', model: 'User', select: 'firstName lastName avatar' },
      ]);
    } 
    // else if (role === UserRole.VENDOR) {
    //   result = await this.service.paginatedFind({ vendorId: req.user?._id });
    // } else if (role === UserRole.ADMIN) {
    //   result = await this.service.paginatedFind({}, {}, [
    //     { path: 'vendorId', model: 'User', select: 'firstName lastName avatar' },
    //   ]);
    // } 
    else throw new this.HttpError('invalid user type');

    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getOne = this.control(async (req: Request) => {
    let result;
    let findQuery;
    let session;
    let orders;
    const role = req.user?.role;

    if (role === UserRole.USER) {
      if (Types.ObjectId.isValid(req.params.sessionRef)) {
        findQuery = { userId: req.user?._id, _id: req.params.sessionRef };
      } else {
        findQuery = { userId: req.user?._id, customId: `#${req.params.sessionRef}` };
      }
    } else if (role === UserRole.ADMIN) {
      if (Types.ObjectId.isValid(req.params.sessionRef)) {
        findQuery = { _id: req.params.sessionRef };
      } else {
        findQuery = { customId: `#${req.params.sessionRef}` };
      }
    } else throw new this.HttpError('invalid user type');

    orders = await this.find(
      { sessionId: session._id },
      {
        multiPopulate: [
          {
            path: 'vendorId',
            model: 'User',
            select: 'firstName lastName avatar',
          },
          {
            path: 'items.productId',
            model: 'Product',
          },
        ],
      },
    );

    result = { ...session, orders };

    return result;
  });

}

export default OrderSessionController;
