/* eslint-disable import/no-unresolved */
import MessageController from '@controllers/message.controller';
import { messageRequestDTO } from '@dtos/message.dto';
import Route from '@routes/route';
import { MessageInterface } from '@interfaces/Messages.Interface';
import { authorize, authorizeVendor } from '@middlewares/jwt';

export default class MessageRoute extends Route<MessageInterface> {
  controller = new MessageController('message');
  dto = messageRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get(authorizeVendor(), this.controller.getMessage)
      .post(
        authorize(),
        this.fileProcessor.uploadArray('attachment'),
        this.validator(this.dto.create),
        this.controller.create,
      );

    this.router
      .route('/user-message')
      .get(this.authorize(), this.controller.getUserMessage);

    this.router
      .route('/vendor-message')
      .get(this.authorizeVendor(), this.controller.getVendorMessage);

    return this.router;
  }
}
