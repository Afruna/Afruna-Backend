import HttpError from '@helpers/HttpError';
import { NotificationInterface } from '@interfaces/Notification.Interface';
import NotificationRepository from '@repositories/Notification.repo';
import Service from '@services/service';
import { Types } from 'mongoose';

class NotificationService extends Service<NotificationInterface, NotificationRepository> {
  private static _instance: NotificationService;
  protected repository = new NotificationRepository();

  static instance() {
    if (!NotificationService._instance) {
      NotificationService._instance = new NotificationService();
    }
    return NotificationService._instance;
  }

  async markAsRead (id: string | Types.ObjectId) {
    this.update({ _id: id }, { is_read: true })
  }

  async deleteAll () {
    this.repository.delete({});
  }
  
}

export default NotificationService;
