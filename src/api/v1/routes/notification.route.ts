/* eslint-disable import/no-unresolved */
import Route from '@routes/route';
import { UserRole } from '@interfaces/User.Interface';
import { notificationRequestDTO } from '@dtos/notification.dto';
import NotificationController from '@controllers/notification.controller';
import { NotificationInterface } from '@interfaces/Notification.Interface';
import { authenticateUserOrVendor } from '@middlewares/jwt';
// import { authorize } from '@middlewares/jwt';

export default class NotificationRoute extends Route<NotificationInterface> {
  dto = notificationRequestDTO;
  controller = new NotificationController('notification');
  initRoutes() {
    this.router
      .route('/')
      .get(this.authorize(), this.controller.get)
      .post(
        this.authorize(),
        this.validator(this.dto.create),
        this.controller.create,
      )
      .delete(authenticateUserOrVendor(), this.controller.deleteAll);

    this.router
      .route('/my/vendor')
      .get(this.authorizeVendor(), this.controller.getVendor)
      .post(
        this.authorizeVendor(),
        this.validator(this.dto.create),
        this.controller.createVendor,
      );

    this.router
      .route('/:notificationId')
      .put( authenticateUserOrVendor(), this.validator(this.dto.update), this.controller.markAsRead)
      .delete(authenticateUserOrVendor(), this.validator(this.dto.update), this.controller.delete);
    
    return this.router;
  }
}
