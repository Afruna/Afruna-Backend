import HttpError from '@helpers/HttpError';
import { BookingInterface, BookingStatus } from '@interfaces/Booking.Interface';
import BookingRepository from '@repositories/Booking.repo';
import Service from '@services/service';
import ProvideService from './provide.service';
import UserService from './user.service';
import VendorRepository from '@repositories/Vendor.repo';
import { VendorType } from '@interfaces/Vendor.Interface';
import ServiceCategoryRepository from '@repositories/ServiceCategory.repo';
import ProvideRepository from '@repositories/Provide.repo';
import MessageRepository from '@repositories/Message.repo';
import { UserInterface } from '@interfaces/User.Interface';
import MessageService from './message.service';
import ChatService from './chat.service';
import { ChatInterface, MESSAGE_TYPE, USER_TYPE } from '@interfaces/Chat.Interface';
import { ConversationService } from './ConversationService';
import NotificationService from './notification.service';
// import ProductService from './product.service';
// import { logger } from '@utils/logger';
// import s3 from '@helpers/multer';
// import { OPTIONS } from '@config';

class BookingService extends Service<BookingInterface, BookingRepository> {
  protected repository = new BookingRepository();
  protected vendorRepo = new VendorRepository();
  protected provideRepo = new ProvideRepository();
  protected _messageRepo = new MessageRepository();
  protected readonly _provideService = ProvideService.instance;
  protected readonly _userService = UserService.instance;
  private static _instance: BookingService;
  protected readonly _messageService = new MessageService();
  protected readonly _chatService = new ChatService();
  protected readonly _conversationService = new ConversationService();
  protected _notificationService = NotificationService.instance;

  async createBooking(user: Partial<UserInterface>, data: Partial<BookingInterface>) {
    const service = await this.provideRepo.findOne({ _id: data.serviceId.toString() });

    if (!service) throw new HttpError('Service does not exist');

    const vendor = await this.vendorRepo.findOne({ _id: data.vendorId.toString() });

    if (!vendor) throw new HttpError('Vendor does not exist');

    if (vendor.vendorType == (VendorType.MARKET_SELLER as VendorType))
      throw new HttpError('Vendor must be of Service Provider');

   

    // let message = await this._messageRepo.custom().findOne({
    //   $or: [
    //     {
    //       $and: [{ fromId: user._id }, { toId: vendor._id }],
    //     },
    //     {
    //       $and: [{ toId: user._id }, { fromId: vendor._id }],
    //     },
    //   ],
    // });

    // const from = { id: <string>user._id, name: `${user.firstName} ${user.lastName}`, userType: USER_TYPE.USER };

    // const to = { id: vendor._id, name: `${vendor.firstname} ${vendor.lastname}`, userType: USER_TYPE.VENDOR };

    // const chat: ChatInterface = {
    //   from,
    //   to,
    //   message: `${vendor.firstname} ${vendor.lastname}, You have a new Booking Request`,
    //   messageType: MESSAGE_TYPE.NORMAL,
    // };

    // const chatMessage = await this._chatService.create({ ...chat });

    // if (!message) {
    //   messageObj = await this._messageService.create({
    //     fromId: <string>user._id,
    //     toId: vendor._id,
    //     from,
    //     to,
    //     chats: [chatMessage],
    //   });
    //   messageId = messageObj._id;
    // } else {
    //   messageObj = await this._messageRepo.update(
    //     { _id: message._id },
    //     {
    //       load: { key: 'chats', value: chatMessage },
    //     },
    //   );
    // }

    //attend to the duplication here

    await this._notificationService().create({
      vendorId: vendor._id,
      subject: 'New Booking Request',
      message: `${vendor.firstname} ${vendor.lastname}, You have a new Booking Request`,
      sent_at: new Date(),
      is_read: false,
    })

    return this.repository.create({ userId: <string>user._id, ...data });
  }

  async changeBookingStatus(_id: string, status: BookingStatus,user: Partial<UserInterface>) {
    let messageObj = null;
    let messageId = null;

    user = await this._userService().findOne({ _id: user._id as string });
    console.log(user);
    if (!user) throw new HttpError('User does not exist');

    let data = await this.repository.findOne({ _id });
    if (!data) throw new HttpError('Booking does not exist');

    const vendor = await this.vendorRepo.findOne({ _id: data.vendorId.toString() });
    if (!vendor) throw new HttpError('Vendor does not exist');

    if(status == BookingStatus.ACCEPTED){
      const conversation = await this._conversationService.createConversation([
      { id: user._id as string, name: `${user.firstName} ${user.lastName}`, userType: USER_TYPE.USER },
      { id: vendor._id, name: `${vendor.firstname} ${vendor.lastname}`, userType: USER_TYPE.VENDOR },
    ]);
    
    const message = await this._conversationService.sendMessage({
      conversationId: conversation._id,
      content: `${vendor.firstname} ${vendor.lastname}, You have a new Booking Request`,
      from: user._id
    });
    }

    return await this.repository.update({ _id }, { status });
  }

  static instance() {
    if (!BookingService._instance) {
      BookingService._instance = new BookingService();
    }
    return BookingService._instance;
  }

  find(
    query?:
      | Partial<
          DocType<BookingInterface> & {
            page?: string | number | undefined;
            limit?: string | number | undefined;
          }
        >
      | undefined,
    options?: OptionsParser<BookingInterface>,
  ): Promise<DocType<BookingInterface>[]> {
    return this.repository.find(query, {
      ...options,
      multiPopulate: [
        {
          path: 'userId',
          model: 'User',
        },
        {
          path: 'vendorId',
          model: 'Vendor',
        },
        {
          path: 'serviceId',
          model: 'Service',
        },
      ],
    });
  }

  findOne(
    query: string | Partial<BookingInterface>,
    options?: Omit<OptionsParser<BookingInterface>, 'sort' | 'limit' | 'skip'> | undefined,
  ) {
    return this.repository.findOne(query, {
      ...options,
      multiPopulate: [
        {
          path: 'userId',
          model: 'User',
        },
        {
          path: 'vendorId',
          model: 'Vendor',
        },
        {
          path: 'serviceId',
          model: 'Service',
        },
      ],
    });
  }
}

export default BookingService;
