/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import ConversationService from '@services/conversation.service';
import { ConversationInterface } from '@interfaces/Conversation.Interface';
import Controller from '@controllers/controller';
// import { ConversationResponseDTO } from '@dtos/Conversation.dto';

class ConversationController extends Controller<ConversationInterface> {
  service = new ConversationService();
  responseDTO = undefined; // ConversationResponseDTO.Conversation;

  get = this.control((req: Request) => {
    return this.service.fetch(<string>req.user?._id.toString());
  });
}

export default ConversationController;
