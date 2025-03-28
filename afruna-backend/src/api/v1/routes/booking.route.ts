/* eslint-disable import/no-unresolved */
import BookingController from '@controllers/booking.controller';
import Route from '@routes/route';
import { BookingInterface } from '@interfaces/Booking.Interface';
import { UserRole } from '@interfaces/User.Interface';
import { bookingRequestDTO } from '@dtos/booking.dto';

export default class BookingRoute extends Route<BookingInterface> {
  dto = bookingRequestDTO;
  controller = new BookingController('booking');
  initRoutes() {
    this.router
      .route('/')
      .get(this.authorize(), this.controller.get)
      .post(this.authorize(UserRole.USER), this.validator(this.dto.create), this.controller.create);
    this.router
      .route('/get/:bookingId')
      .get(this.authorize(), this.validator(this.dto.id), this.controller.getBooking)
      .put(this.authorize(), this.validator(this.dto.id.concat(this.dto.update)), this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    this.router.get('/getByVendor', this.authorizeVendor(), this.controller.getWithVendorId);
    this.router.patch('/:bookingId/changeStatus',this.validator(this.dto.id),  this.authorizeVendor(), this.controller.changeStatus);
    this.router.get('/getByUser', this.authorize(), this.controller.getAllByUser);

    // this.router
    //   .route('/:providerId/provider')
    //   .get(this.authorize(), this.validator(this.dto.providerId), this.controller.getWithProviderId);

    return this.router;
  }
}
