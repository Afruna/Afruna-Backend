import { ChatInterface } from '@interfaces/Chat.Interface';
import ChatRepository from '@repositories/Chat.repo';
import Service from '@services/service';
import MessageService from './message.service';
import UserService from './user.service';
import HttpError from '@helpers/HttpError';

export default class ChatService extends Service<ChatInterface, ChatRepository> {
  protected repository = new ChatRepository();
  private readonly _userService = new UserService();
  private static _instance: ChatService;

  async fetch(data: { id: string }) {

    return await this.custom().find({
      $or: [
          { "from.id": data.id },
          { "to.id": data.id },
      ]
  })
    // let convo = await this.custom().find().in('recipients', [id]).sort({ updatedAt: -1 });

    // if (convo.length === 0) return [];

    // return Promise.all(
    //   convo.map(async (val) => {
    //     const _count = await this._chatService().count({
    //       conversation: val._id,
    //       seen: <any>{ $nin: [id] },
    //     });

    //     val.unreadMessages = _count;
    //     let x = val.recipients.filter((value) => {
    //       return value.toString() !== id.toString();
    //     });
    //     let user = await this._userService.findOne(x[0].toString());
    //     // if (!user) throw new HttpError('user error');
    //     if (!user) return val;
    //     // if (!user) {
    //     //   user = {} as any;
    //     //   user!.firstName = 'deleted';
    //     //   user!.lastName = 'user';
    //     // }
    //     val.alias = user!.firstName + ' ' + user!.lastName;
    //     // val.aliasAvatar = user.avatar;
    //     // val.state = user.state;
    //     return val;
    //   }),
    // );
  }
  static instance() {
    if (!ChatService._instance) {
      ChatService._instance = new ChatService();
    }
    return ChatService._instance;
  }
}
