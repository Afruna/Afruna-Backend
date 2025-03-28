import { BookingInterface } from '@interfaces/Booking.Interface';
import Booking from '@models/Booking';
import Repository from '@repositories/repository';

class BookingRepository extends Repository<BookingInterface> {
  protected model = Booking;
}

export default BookingRepository;
