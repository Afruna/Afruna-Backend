/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import { Types } from 'mongoose';
import OrderService from '@services/order.service';
import { OrderInterface } from '@interfaces/Order.Interface';
import Controller from '@controllers/controller';
import { UserRole } from '@interfaces/User.Interface';
import axios from 'axios';
import HttpError from '@helpers/HttpError';

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

  // getShippingRates = this.control(async (req: Request) => {
  //   try {
  //     const { destination, items } = req.body;

  //     // Validate required fields
  //     if (!destination || !items || !Array.isArray(items)) {
  //       throw new HttpError('Invalid request: destination and items array are required', 400);
  //     }

  //     // Validate destination object
  //     if (!destination.country || !destination.state || !destination.city) {
  //       throw new HttpError('Invalid destination: country, state, and city are required', 400);
  //     }

  //     // Calculate total weight
  //     const totalWeight = items.reduce((sum, item) => {
  //       if (!item.weight || !item.quantity) {
  //         throw new HttpError('Invalid item: weight and quantity are required', 400);
  //       }
  //       return sum + item.weight * item.quantity;
  //     }, 0);

  //     // Validate total weight
  //     if (totalWeight <= 0) {
  //       throw new HttpError('Invalid total weight: must be greater than 0', 400);
  //     }

  //     try {
  //       const response = await axios.post('https://api.shipbubble.com/v1/shipping/rates', {
  //         origin: {
  //           country: "NG",
  //           state: "Lagos",
  //           city: "Ikeja"
  //         },
  //         destination,
  //         package: {
  //           weight: totalWeight,
  //           weight_unit: "kg",
  //         }
  //       }, {
  //         headers: {
  //           Authorization: `Bearer sb_sandbox_680615a07122033eac37ebee2be93c79a395ff293c8c508642f2c0cd33644354`
  //         }
  //       });

  //       // Validate response data
  //       if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
  //         throw new HttpError('Invalid response from shipping service', 500);
  //       }

  //       const rates = response.data.data;
        
  //       // Map and validate each rate
  //       return rates.map((rate: any) => {
  //         if (!rate.id || !rate.name || !rate.price || !rate.carrier) {
  //           throw new HttpError('Invalid shipping rate data received', 500);
  //         }

  //         return {
  //           id: rate.id,
  //           name: rate.name,
  //           price: rate.price,
  //           estimated_days: rate.estimated_days || 'N/A',
  //           carrier: rate.carrier,
  //         };
  //       });

  //     } catch (error) {
  //       if (axios.isAxiosError(error)) {
  //         // Handle specific API errors
  //         if (error.response) {
  //           // The request was made and the server responded with a status code
  //           // that falls out of the range of 2xx
  //           throw new HttpError(
  //             `Shipping service error: ${error.response.data?.message || error.message}`,
  //             error.response.status
  //           );
  //         } else if (error.request) {
  //           // The request was made but no response was received
  //           throw new HttpError('No response from shipping service', 503);
  //         } else {
  //           // Something happened in setting up the request
  //           throw new HttpError(`Error setting up shipping request: ${error.message}`, 500);
  //         }
  //       }
  //       throw error; // Re-throw if it's not an Axios error
  //     }

  //   } catch (error) {
  //     // Handle any other errors
  //     if (error instanceof HttpError) {
  //       throw error;
  //     }
  //     throw new HttpError(`Error getting shipping rates: ${error.message}`, 500);
  //   }
  // });

  getShippingRates = this.control(async (req: Request) => {
    try {
      const dto = req.body;
  
      const totalWeight = dto.items.reduce((sum, item) => {
        return sum + item.weight * item.quantity;
      }, 0);
  
      if (totalWeight <= 0) {
        throw new HttpError('Invalid total weight: must be greater than 0', 400);
      }
  
      // Build request payload for Shipbubble
      const payload = {
        origin: {
          country: 'NG',
          state: 'Lagos',
          city: 'Ikeja'
        },
        destination: dto.destination,
        package: {
          weight: totalWeight,
          weight_unit: 'kg'
        }
      };
  
      const response = await axios.post("https://api.shipbubble.com/v1/shipping/fetch_rates", payload, {
        headers: {
          Authorization: `Bearer sb_sandbox_680615a07122033eac37ebee2be93c79a395ff293c8c508642f2c0cd33644354`
        }
      });
  
      if (!response.data?.data || !Array.isArray(response.data.data)) {
        throw new HttpError('Invalid response from shipping service', 500);
      }
  
      const rates = response.data.data.map((rate: any) => {
        if (!rate.id || !rate.name || !rate.price || !rate.carrier) {
          throw new HttpError('Invalid shipping rate data received', 500);
        }
  
        return {
          id: rate.id,
          name: rate.name,
          price: rate.price,
          estimated_days: rate.estimated_days || 'N/A',
          carrier: rate.carrier
        };
      });
  
      return rates;
  
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new HttpError(
            `Shipping service error: ${error.response.data?.message || error.message}`,
            error.response.status
          );
        } else if (error.request) {
          throw new HttpError('No response from shipping service', 503);
        } else {
          throw new HttpError(`Error setting up shipping request: ${error.message}`, 500);
        }
      }
  
      if (error instanceof HttpError) throw error;
  
      // Class-validator errors or other unexpected errors
      throw new HttpError(`Error getting shipping rates: ${error.message}`, 500);
    }
  });
}

export default OrderController;
