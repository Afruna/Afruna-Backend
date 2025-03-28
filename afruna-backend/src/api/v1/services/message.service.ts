import { ConversationInterface } from '@interfaces/Conversation.Interface';
import { MessageInterface } from '@interfaces/Messages.Interface';
import Service from '@services/service';
import ConversationService from './conversation.service';
import MessageRepository from '@repositories/Message.repo';
import UserService from './user.service';
import ChatRepository from '@repositories/Chat.repo';

export default class MessageService extends Service<MessageInterface, MessageRepository> {
  protected repository = new MessageRepository();
  private readonly _conversationService = ConversationService.instance();
  private readonly _userService = UserService.instance;
  private static _instance: MessageService;
  private readonly chatRepo = new ChatRepository();

  async createMessage(data: MessageInterface) {
    let messageId = null;
    let messageObj = null;

    let message = await this.repository.custom().findOne({
      $or: [
          {
            $and: [
                { fromId: data.from.id },
                { toId: data.to.id } 
              ]
          },
          {
            $and: [
                { toId: data.from.id } ,
                { fromId: data.to.id }
            ]
        }
      ]
     });


    //  let message = await this._messageRepo.custom().findOne({
    //   $or: [
    //       {
    //         $and: [
    //             { from: { id: chat.from.id } },
    //             { to: { id: chat.to.id } }
    //           ]
    //       },
    //       {
    //         $and: [
    //             { to: { id: chat.from.id } },
    //             { from: { id: chat.to.id } }
    //         ]
    //     }
    //   ]
    //  });

     console.log(message)

     if(!message)
      {
        messageObj =  await this.create({fromId: data.from.id, toId: data.to.id, from: data.from, to: data.to});
        messageId = messageObj._id
      }
      else
        messageId = message._id;

    return messageId;
  }

 getMessages = async(userId) => {
    // const messages = await this.repository.custom().find({
    //   $or: [
    //     { fromId: userId },
    //     { toId: userId },
    //   ]
    //  });

    const messages = await this.repository.find({},{ or: [{ fromId: userId }, { toId: userId }], populate: { 
      path: 'chats',
      model: 'Chat',
      populate: {
        path: 'quote',
        model: 'Quote',
      },
    } 
  })


    //  messages.map(async(message: MessageInterface) => {
    //   let chatss = [];
    //   let chats = await this.chatRepo.find({
    //     messageId: message._id
    //   })
    //   chats.forEach(chat => {
    //     message.chats.push({ from: { id: chat.from.id, name: chat.from.name, userType: chat.from.userType} });
    //   })

    //   return message;
      
    //  })

     return messages;
  }

  static instance() {
    if (!MessageService._instance) {
      MessageService._instance = new MessageService();
    }
    return MessageService._instance;
  }
}
