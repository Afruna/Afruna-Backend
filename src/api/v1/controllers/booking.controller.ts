/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import BookingService from '@services/booking.service';
import { BookingInterface } from '@interfaces/Booking.Interface';
import Controller from '@controllers/controller';

class BookingController extends Controller<BookingInterface> {
  service = new BookingService();
  responseDTO = undefined; 

  create = this.control((req: Request) => {
    const data = req.body;
    return this.service.createBooking(req.user, data);
  });

  changeStatus = this.control((req: Request) => {
    const data = req.body;
    return this.service.changeBookingStatus(req.params.bookingId, data);
  });

  getWithVendorId = this.control(async (req: Request) => {
    return this.service.find({ vendorId: req.vendor._id }, { multiPopulate: [
      {
        path: 'serviceId',
        model: 'Service',
      },
      {
        path: 'vendorId',
        model: 'Vendor',
      }
    ]});
  });

  get = this.control((req: Request) => {
    const query: {
      [x: string]: string | boolean;
    } = this.safeQuery(req);

    if (req.user) 
      query.userId = req.user._id.toString();
    else if (req.vendor) 
        query.providerId = req.vendor._id.toString();

    if (query.search) {
      Object.assign(query, this.parseSearchKey(<string>query.search, ['name']));
      delete query.search;
    }
    return this.service.paginatedFind(query, { description: 1 }, [
      {
        path: 'serviceId',
        model: 'Service'
      },
      {
        path: 'vendorId',
        model: 'Vendor',
      }
    ]);
  });


  getBooking = this.control((req: Request) => {
    
    const query = {_id: req.params.bookingId}
    return this.service.findOne(query, { multiPopulate: [
      {
        path: 'serviceId',
        model: 'Service'
      },
      {
        path: 'vendorId',
        model: 'Vendor',
      }
    ] });
  });

  getAllByUser = this.control((req: Request) => {
    const query: {
      [x: string]: string | boolean;
    } = this.safeQuery(req);

    
    query.userId = req.user._id.toString();
     

    if (query.search) {
      Object.assign(query, this.parseSearchKey(<string>query.search, ['name']));
      delete query.search;
    }
    return this.service.paginatedFind(query, { description: 1 }, [
      {
        path: 'serviceId',
        model: 'Service'
      },
      {
        path: 'vendorId',
        model: 'Vendor',
      }]);
  });

  getAllByVendor = this.control((req: Request) => {
    const query: {
      [x: string]: string | boolean;
    } = this.safeQuery(req);

    
    query.userId = req.vendor._id.toString();
     

    if (query.search) {
      Object.assign(query, this.parseSearchKey(<string>query.search, ['name']));
      delete query.search;
    }
    return this.service.paginatedFind(query, { description: 1 }, [
      {
        path: 'serviceId',
        model: 'Service'
      },
      {
        path: 'vendorId',
        model: 'Vendor',
      }]);
  });
}

export default BookingController;
