/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import { Types } from 'mongoose';
import OrderService from '@services/order.service';
import { OrderInterface } from '@interfaces/Order.Interface';
import Controller from '@controllers/controller';
import { UserRole } from '@interfaces/User.Interface';
// import { OrderResponseDTO } from '@dtos/Order.dto';

class OrderController extends Controller<OrderInterface> {
  service = new OrderService();
  responseDTO = undefined; // OrderResponseDTO.Order;

  create = this.control(async (req: Request) => {
    let data = req.body;
    // if (data.addressId) {
    //   data = await this.service.getAddress(req.user?._id, data.addressId);
    // } else {
    //   data = (await this.service.addAddress(req.user?._id, req.body))?.addresses;
    // }
    return this.service.createOrder(req.user?._id, data.addressId, data.paymentMethod);
  });

  getAddresses = this.control(async (req: Request) => {
    return req.user?.addresses || [];
  });

  getOne = this.control(async (req: Request) => {
    let result;
    let findQuery;
    const role = req.user?.role;

    if (role === UserRole.USER) {
      if (Types.ObjectId.isValid(req.params.ref)) {
        findQuery = { userId: req.user?._id, _id: req.params.ref };
      } else {
        findQuery = { userId: req.user?._id, customId: `#${req.params.ref}` };
      }

      result = await this.service.findOne(findQuery, {
        multiPopulate: [
          {
            path: 'addressId',
            model: 'Address'
          },
          {
            path: 'items.productId',
            model: 'Product',
          },
        ],
      });
    } else if (role === UserRole.ADMIN) {
      if (Types.ObjectId.isValid(req.params.ref)) {
        findQuery = { _id: req.params.ref };
      } else {
        findQuery = { customId: `#${req.params.ref}` };
      }
      result = await this.service.findOne(findQuery, {
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
          {
            path: 'userId',
            model: 'User',
            select: 'firstName lastName avatar',
          }
        ],
      });
    } else if (role === UserRole.VENDOR) {
      if (Types.ObjectId.isValid(req.params.ref)) {
        findQuery = { vendorId: req.user?._id, _id: req.params.ref };
      } else {
        findQuery = { vendorId: req.user?._id, customId: `#${req.params.ref}` };
      }

      result = await this.service.findOne(findQuery, {
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
      });
    } else throw new this.HttpError('invalid user type');

    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  get = this.control(async (req: Request) => {
    let result;
    const role = req.user?.role;

    console.log("User", req.user);

    if (role === UserRole.USER) {
      result = await this.service.paginatedFind({ userId: req.user?._id }, { createdAt: -1 }, [
        { path: 'vendorId', model: 'User', select: 'firstName lastName avatar' },
        { path: 'addressId', model: 'Address' },
        { path: 'items.productId', model: 'Product' },
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

  getSession = this.control(async (req: Request) => {
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

    session = await this.service.session.findOne(findQuery);
    if (!session) throw new this.HttpError(`session not found`, 404);

    orders = await this.service.find(
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

  getUserOrder = this.control(async (req: Request) => {
    
    const findQuery = { userId: req.user?._id };

    const orders = await this.service.getUserOrder(req.user?._id);

    return orders;
  });

  getUserOrders = this.control(async (req: Request) => {
    
    const findQuery = { userId: req.user?._id };

    const orders = await this.service.getUserOrders(req.user?._id);

    return orders;
  });

  getVendorOrder = this.control(async (req: Request) => {
    
    const findQuery = { vendor: req.vendor?._id };

    const orders = await this.service.getVendorOrder(req.vendor?._id);

    return orders;
  });

  track = this.control(async (req: Request) => {
    let findQuery;
    if (Types.ObjectId.isValid(req.params.ref)) {
      findQuery = { _id: req.params.ref };
    } else {
      findQuery = { customId: `#${req.params.ref}` };
    }
    const result = await this.service.findOne(findQuery, {
      multiPopulate: [
        {
          path: 'items.productId',
          model: 'Product',
          select: 'name images price',
        },
        {
          path: 'vendorId',
          model: 'User',
          select: 'firstName lastName avatar',
        },
        {
          path: 'sessionId',
          model: 'OrderSession',
          select: 'sessionDetails',
        },
      ],
    });

    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return { success: true, message: 'OK', data: result };
  });

  trackOrder = this.control(async (req: Request) => {

   const result = await this.service.trackOrder(req.params.ref);

   console.log(result)

    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  addAddress = this.control(async (req: Request) => {});
}

export default OrderController;
