
import { NotificationInterface } from '@interfaces/Notification.Interface';
import Notification from '@models/Notification';
import Repository from '@repositories/repository';

class NotificationRepository extends Repository<NotificationInterface> {
  protected model = Notification;
}

export default NotificationRepository;
