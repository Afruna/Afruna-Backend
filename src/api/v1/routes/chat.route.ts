/* eslint-disable import/no-unresolved */
import ChatController from '@controllers/chat.controller';
import Route from '@routes/route';
import { ChatInterface } from '@interfaces/Chat.Interface';
import { authorize } from '@middlewares/jwt';

export default class ChatRoute extends Route<ChatInterface> {
  controller = new ChatController('chat');
  dto = null;
  initRoutes() {
    this.router
      .route('/')
      .get(authorize(), this.controller.get)
      .post(
        authorize(),
        this.controller.create,
      );

    this.router
      .route('/vendor')
      .get(this.authorizeVendor(), this.controller.getVendor);
    
    return this.router;
  }
}
