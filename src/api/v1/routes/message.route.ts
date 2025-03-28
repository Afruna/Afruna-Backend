/* eslint-disable import/no-unresolved */
import MessageController from '@controllers/message.controller';
// import { messageRequestDTO } from '@dtos/message.dto';
import Route from '@routes/route';
import { MessageInterface } from '@interfaces/Messages.Interface';
import { authorize, authorizeVendor,authenticateUserOrVendor } from '@middlewares/jwt';

export default class MessageRoute extends Route<MessageInterface> {
  controller = new MessageController('message');
  // dto = messageRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get(authenticateUserOrVendor(), this.controller.getMessage)
      .post(
        authenticateUserOrVendor(),
        this.fileProcessor.uploadArray('attachment'),
        // this.validator(this.dto.create),
        this.controller.create,
      );

    this.router
      .route('/user-message/:conversationId')
      .get(this.authorize(), this.controller.getUserMessage);

    this.router
      .route('/vendor-message/:conversationId')
      .get(this.authorizeVendor(), this.controller.getVendorMessage);

    return this.router;
  }
}
