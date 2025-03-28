/* eslint-disable import/no-unresolved */
import ConversationController from '@controllers/conversation.controller';
import Route from '@routes/route';
import { ConversationInterface } from '@interfaces/Conversation.Interface';
import { authorize } from '@middlewares/jwt';

export default class ConversationRoute extends Route<ConversationInterface> {
  dto = null;
  controller = new ConversationController('conversation');
  initRoutes() {
    this.router.route('/').get(authorize(), this.controller.get);

    return this.router;
  }
}
