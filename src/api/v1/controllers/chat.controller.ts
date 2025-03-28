/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import ChatService from '@services/chat.service';
import { ChatInterface } from '@interfaces/Chat.Interface';
import Controller from '@controllers/controller';
import { OPTIONS } from '@config';
// import { MessageResponseDTO } from '@dtos/Message.dto';

class ChatController extends Controller<ChatInterface> {
  service = new ChatService();
  responseDTO = undefined; // MessageResponseDTO.Message;
  create = this.control(async (req: Request) => {
    this.processFile(req);
    const data = <ChatInterface>req.body;
    //data.from = req.user?._id.toString();
    const result = await this.service.create(data);
    if (OPTIONS.USE_SOCKETS) {
     // req.io.to(<string>result.convo.toString()).emit('message', result);
    }
    return result;
  });

  get = this.control((req: Request) => {
    return this.service.fetch({
      id: <string>req.user?._id,
    });
  });

  getVendor = this.control((req: Request) => {
    return this.service.fetch({
      id: <string>req.vendor?._id,
    });
  });
}

export default ChatController;
