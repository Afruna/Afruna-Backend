import { NotificationInterface, NotificationStatusEnum } from '@interfaces/Notification.Interface';
import { Schema, model } from 'mongoose';

const NotificationSchema = new Schema<NotificationInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'User' },
    subject: String,
    message: String,
    sent_at: {
      type: Date,
      default: Date.now, // Automatically sets the current date and time
    },
    is_read: {
      type: Boolean,
      default: false, // Automatically sets the current date and time
    },
    status: { type: String, enum: Object.values(NotificationStatusEnum), default: NotificationStatusEnum.PENDING },
  },
  { timestamps: true },
);

const Notification = model('Notification', NotificationSchema);

export default Notification;
