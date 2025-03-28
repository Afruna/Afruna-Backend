import { QuoteInterface } from '@interfaces/Quote.Interface';
import QuoteRepository from '@repositories/Quote.repo';
import Service from '@services/service';
import UserService from './user.service';
import HttpError from '@helpers/HttpError';
import MessageService from './message.service';
import ChatService from './chat.service';
import { ChatInterface, MESSAGE_TYPE, USER_TYPE } from '@interfaces/Chat.Interface';
import ProvideRepository from '@repositories/Provide.repo';
import MessageRepository from '@repositories/Message.repo';
import { VendorInterface } from '@interfaces/Vendor.Interface';
import UserRepository from '@repositories/User.repository';
import VendorRepository from '@repositories/Vendor.repo';

export default class QuoteService extends Service<QuoteInterface, QuoteRepository> {
  protected repository = new QuoteRepository();
  private readonly _userService = new UserService();
  private readonly _messageService = new MessageService();
  private readonly _chatService = new ChatService();
  private static _instance: QuoteService;
  protected provideRepo = new ProvideRepository();
  protected _messageRepo = new MessageRepository();
  protected userRepo = new UserRepository();
  protected vendorRepo = new VendorRepository();

  async createQuote(data: Partial<QuoteInterface>) {
    
    const user = await this.userRepo.findOne({ _id: data.userId.toString() });

    if(!user)
      throw new HttpError("User does not exist");

    const vendor = await this.vendorRepo.findOne({ _id: data.vendorId.toString() });

    console.log(vendor)

    if(!vendor)
      throw new HttpError("Vendor does not exist");

    const service = await this.provideRepo.findOne({ _id: data.serviceId.toString() });

    if(!service)
      throw new HttpError("Service does not exist");

    const quote = await this.repository.create(data);

    let messageObj = null;
    let messageId = null;

    let message = await this._messageRepo.custom().findOne({
      $or: [
          {
            $and: [
                { fromId: user._id },
                { toId: vendor._id } 
              ]
          },
          {
            $and: [
                { toId: user._id } ,
                { fromId: vendor._id }
            ]
        }
      ]
     });

     const from = {id: <string>vendor._id, name: `${vendor.firstname} ${vendor.lastname}`, userType: USER_TYPE.VENDOR }; 

     const to = {id: user._id, name: `${user.firstName} ${user.lastName}`, userType: USER_TYPE.USER }; 

     const chat: ChatInterface = {
      from,
      to,
      message: `${user.firstName} ${user.lastName}, You have a new Quote`,
      messageType: MESSAGE_TYPE.QUOTE,
      quote,
      quoteData: { userId: user._id, vendorId: vendor._id, amount: data.amount, serviceId: data.serviceId, serviceTitle: service.name }
    }

     const chatMessage = await this._chatService.create({ ...chat });

    if(!message)
      {
        messageObj =  await this._messageService.create({fromId: <string>vendor._id, toId: user._id, from, to, chats: [chatMessage]});
        messageId = messageObj._id
      }
      else
      {
        messageObj = await this._messageRepo.update(
          { _id : message._id },
          {
            load: { key: 'chats', value: chatMessage }
          },
        );
      }
    // const messageId = await this._messageService.createMessage({ fromId: data.vendorId.toString(), toId: data.userId.toString() })
    // const newMessage = this._chatService.create({ message: "Vendor Created New Quote", quote, messageType: MESSAGE_TYPE.QUOTE , messageId });

    return quote;
  }

  static instance() {
    if (!QuoteService._instance) {
      QuoteService._instance = new QuoteService();
    }
    return QuoteService._instance;
  }
}
