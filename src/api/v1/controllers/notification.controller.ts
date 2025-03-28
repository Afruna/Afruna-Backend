/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import ProvideService from '@services/provide.service';
import { ProvideInterface } from '@interfaces/Provide.Interface';
import Controller from '@controllers/controller';
import { NotificationInterface } from '@interfaces/Notification.Interface';
import NotificationService from '@services/notification.service';

class NotificationController extends Controller<NotificationInterface> {
  service = new NotificationService();
  responseDTO = undefined; // ProvideResponseDTO.Provide;

  create = this.control(async (req: Request) => {
    const result = await this.service.create({ userId: req.user?._id, ...req.body });
    return result;
  });

  createVendor = this.control(async (req: Request) => {
    const result = await this.service.create({ userId: req.vendor?._id, ...req.body });
    return result;
  });

  get = this.control(async (req: Request) => {
    const result = await this.service.find({ userId: req.user?._id });
    return result;
  });

  getVendor = this.control(async (req: Request) => {
    const result = await this.service.find({ vendorId: req.vendor?._id });
    return result;
  });

  markAsRead = this.control(async (req: Request) => {
    const result = await this.service.markAsRead(req.params[this.resourceId]);
    return result;
  });

  deleteAll = this.control(async (req: Request) => {
    const result = await this.service.delete({ userId: req.user?._id });
    return result;
  });
}
export default NotificationController;
