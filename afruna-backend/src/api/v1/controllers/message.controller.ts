/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import MessageService from '@services/message.service';
import { MessageInterface } from '@interfaces/Messages.Interface';
import Controller from '@controllers/controller';
import { OPTIONS } from '@config';
// import { MessageResponseDTO } from '@dtos/Message.dto';

class MessageController extends Controller<MessageInterface> {
  service = new MessageService();
  responseDTO = undefined; // MessageResponseDTO.Message;
  create = this.control(async (req: Request) => {
    this.processFile(req);
    const data = <MessageInterface>req.body;
    data.from = req.user?._id.toString();
    const result = await this.service.createMessage(data);
    if (OPTIONS.USE_SOCKETS) {
      req.io.to(<string>result.convo.toString()).emit('message', result);
    }
    return result;
  });

  get = this.control((req: Request) => {
    return this.service.find({
      conversation: req.params.conversationId,
      userId: <string>req.user?._id,
    });
  });


  getMessage = this.control((req: Request) => {
    return this.service.getMessages(<string>req.vendor?._id);
  });


  getUserMessage = this.control((req: Request) => {
    return this.service.getMessages(<string>req.user?._id);
  });

  getVendorMessage = this.control((req: Request) => {
    return this.service.getMessages(<string>req.vendor?._id);
  });
}

export default MessageController;
