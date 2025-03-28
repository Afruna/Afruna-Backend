import { BookingInterface, BookingStatus } from '@interfaces/Booking.Interface';
import { Schema, model } from 'mongoose';

const BookingSchema = new Schema<BookingInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    address: String,
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    description: String,
    status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING },
    hasClientConfirmed: { type: Boolean, default: false}
  },
  { timestamps: true },
);

const Booking = model('Booking', BookingSchema);

export default Booking;
