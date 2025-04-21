/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import MessageService from '@services/message.service';
import { MessageInterface } from '@interfaces/Messages.Interface';
import Controller from '@controllers/controller';
import { OPTIONS } from '@config';
import { ConversationService } from '@services/ConversationService';
import Conversation from '@models/Conversation';
// import { MessageResponseDTO } from '@dtos/Message.dto';

class MessageController extends Controller<MessageInterface> {
  service = new MessageService();
  conversationService = new ConversationService();

  responseDTO = undefined; // MessageResponseDTO.Message;
  create = this.control(async (req: Request) => {
    this.processFile(req);
    const data = <MessageInterface>req.body;
    
    data.from = (req.user || req.vendor)?._id.toString();
    const result = await this.conversationService.sendMessage(data);

    if (OPTIONS.USE_SOCKETS) {
      // req.io.to(<string>result.convo.toString()).emit('message', result);
    }
    return result;
  });

  get = this.control((req: Request) => {
    let messages = this.service.find({
      conversationId: req.params.conversationId as string  || req.query.conversationId as string,
    })
    let conversation = Conversation.findOne({
      _id: req.params.conversationId as string  || req.query.conversationId as string});

    return {messages, conversation};
  });


  getMessage = this.control((req: Request) => {
    return this.service.getMessages(<string>req.vendor?._id);
  });


  getUserMessage = this.control((req: Request) => {

    return this.service.getMessages(<string>req.user?._id);
  });

  getVendorMessage = this.control((req: Request) => {
    const conversationId = req.params.conversationId;
    return this.service.getMessages(<string>req.vendor?._id, conversationId);
  });
};

export default MessageController;
