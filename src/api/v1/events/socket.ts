/* eslint-disable array-callback-return */
/* eslint-disable import/prefer-default-export */
import { Server, Socket } from 'socket.io';
import ConversationService from '@services/conversation.service';
import { logger } from '@utils/logger';
import UserService from '@services/user.service';
import { ChatInterface, MESSAGE_TYPE } from '@interfaces/Chat.Interface';
import { Types } from 'mongoose';
import ChatService from '@services/chat.service';
import MessageService from '@services/message.service';
import MessageRepository from '@repositories/Message.repo';
import QuoteService from '@services/quote.service';
import OnlineStatus from '@models/OnlineStatus';
import OnlineStatusService from '@services/onlineStatus.service';
export class SocketEvents {
  io: Server;
  //   socket;
  // Store connected clients
  clients = {};
  // Store user-to-socket mapping
  users = {};

  _conversationService = new ConversationService();
  _quoteService = new QuoteService();
  _messageService = new MessageService();
  _chatService = new ChatService();
  _userService = new UserService();
  _messageRepo = new MessageRepository();
  _onlineStatusService = new OnlineStatusService();
  ;
  constructor(io: Server) {
    this.io = io;

    // this.socket = socket;
  }
  joinConversations = (socket: Socket) => {
    
    console.log('A user connected:', socket.id);

    // Store client information
    this.clients[socket.id] = socket;

    // Register user with username
    socket.on('register', (userId) => {
      this.users[userId] = socket.id;
      this._onlineStatusService.createOnlineStatus({id: userId, isOnline: true});
      console.log(`User registered v3: ${userId} -> ${socket.id}`);
    });

    socket.on('typing_start', (data: { from: string, to: string }) => {
      console.log(this.users)
      console.log(data)
      const recipientSocketId = this.users[data.to];
      console.log(recipientSocketId)
      if (recipientSocketId) {
        console.log("Typing start")
        this.io.to(recipientSocketId).emit('typing_indicator', {
          isTyping: true,
          userId: data.from
        });
      }
    });

    socket.on('typing_end', (data: { from: string, to: string }) => {
      const recipientSocketId = this.users[data.to];
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit('typing_indicator', {
          isTyping: false,
          userId: data.from
        });
      }
    });

    // Listen for private messages
    // socket.on('user_provider', async(chat: ChatInterface) => {
    //   chat = JSON.parse(chat)
    //   const recipientSocketId = this.users[chat.to.id];

    //   console.log("Message", JSON.stringify(chat))

    //   // Save the message in MongoDB
    // //   const message = this._messageRepo.custom().findOne({
    // //     $or: [
            
    // //         { from: { id: chat.from.id } },
    // //         { to: { id: chat.from.id } },
    // //         { from: { id: chat.to.id } },
    // //         { to: { id: chat.to.id } }
    // //     ]
    // // });

    // // let messageId = null;
    // // let messageObj = null;

    // // let message = await this._messageRepo.custom().findOne({
    // //   $or: [
    // //       {
    // //         $and: [
    // //             { fromId: chat.from.id },
    // //             { toId: chat.to.id } 
    // //           ]
    // //       },
    // //       {
    // //         $and: [
    // //             { toId: chat.from.id } ,
    // //             { fromId: chat.to.id }
    // //         ]
    // //     }
    // //   ]
    // //  });


    // //  let message = await this._messageRepo.custom().findOne({
    // //   $or: [
    // //       {
    // //         $and: [
    // //             { from: { id: chat.from.id } },
    // //             { to: { id: chat.to.id } }
    // //           ]
    // //       },
    // //       {
    // //         $and: [
    // //             { to: { id: chat.from.id } },
    // //             { from: { id: chat.to.id } }
    // //         ]
    // //     }
    // //   ]
    // //  });

    // //  console.log(message)

    // //  if(!message)
    // //   {
    // //     messageObj =  await this._messageService.create({fromId: chat.from.id, toId: chat.to.id, from: chat.from, to: chat.to});
    // //     messageId = messageObj._id
    // //   }
    // //   else
    // //     messageId = message._id
      

    // //   const newMessage = this._chatService.create({ ...chat, messageId });
    //   // await newMessage.save();

    // // let messageObj = null;
    // // let messageId = null;

    // // let message = await this._messageRepo.custom().findOne({
    // //   $or: [
    // //       {
    // //         $and: [
    // //             { fromId: chat.from.id },
    // //             { toId: chat.to.id } 
    // //           ]
    // //       },
    // //       {
    // //         $and: [
    // //             { toId: chat.from.id } ,
    // //             { fromId: chat.to.id }
    // //         ]
    // //     }
    // //   ]
    // //  });

    // //  const from = {id: <string>user._id, name: user.email, userType: USER_TYPE.USER }; 

    // //  const to = {id: vendor._id, name: vendor.firstname, userType: USER_TYPE.VENDOR }; 

    // //  const chat: ChatInterface = {
    // //   from,
    // //   to,
    // //   message: "There is a new Booking Request",
    // //   messageType: MESSAGE_TYPE.NORMAL
    // // }

    // //  const chatMessage = await this._chatService.create({ ...chat });

    // //   if(!message)
    // //   {
    // //     messageObj =  await this._messageService.create({fromId: chat.from.id, toId: chat.to.id, from: chat.from, to: chat.to, chats: [chatMessage]});
    // //     messageId = messageObj._id
    // //   }
    // //   else
    // //   {
    // //     messageObj = await this._messageRepo.update(
    // //       { _id : message._id },
    // //       {
    // //         load: { key: 'chats', value: chatMessage }
    // //       },
    // //     );
    // //   }

    //   let messageData = await this._messageService.createMessage(chat)


    //   if (recipientSocketId) {
    //     // Send the message to the recipient
    //     this.io.to(recipientSocketId).emit('receive_message', chat);
    //   } else {
    //     // Notify sender if recipient is offline
    //     socket.emit('error', `User ${chat.to} is offline.`);
    //   }
    // });

    socket.on('user_provider', async (chat: ChatInterface) => {
      try {
        
        const parsedChat = chat;
        console.log(parsedChat)
        console.log("users", this.users)
        const recipientSocketId = this.users[parsedChat.to];

        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('typing_indicator', {
            isTyping: false,
            userId: parsedChat.from.id
          });
        }

        let response;
        if(chat.messageType == MESSAGE_TYPE.QUOTE)
        {
          response = await this._quoteService.createQuote(parsedChat);
        }
        else{
            response = await this._messageService.createMessage(parsedChat);
        }
        console.log("Message", JSON.stringify(parsedChat));
    
        // Save the message in MongoDB
      
    
        if (recipientSocketId) {
          console.log("sending message")
          this.io.to(recipientSocketId).emit('receive_message', response);
        } else {
          console.log('error', `User ${parsedChat.to.id} is offline.`);
        };
      } catch (error) {
        console.error("Error handling user_provider event:", error);
        socket.emit('error', "An error occurred while processing your message.");
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      const userId = Object.keys(this.users).find((key) => this.users[key] == socket.id);
      this._onlineStatusService.createOnlineStatus({id: userId, isOnline: false});
      console.log('A user disconnected v2:', userId);
      delete this.clients[socket.id];
    });

  };

  joinConversation = (socket: Socket) => {
    logger.info(socket.id);
    socket.emit('AFRUNA', 'welcome to AFRUNA');
    socket.on('register', (id: string) => {
      // logger.info(["joining room", provider._id]);
      this._conversationService
        .custom()
        .find()
        .in('recipients', [id])
        .sort({ updatedAt: -1 })
        .then((conversations) => {
          conversations.map((conversation) => {
            socket.join(conversation.id);
          });
          socket.emit('registered', 'registered');
        })
        .catch((error) => {
          socket.emit('error', error);
        });

      this._userService
        .custom()
        .findByIdAndUpdate(id, { online: true, socketId: socket.id })
        .then((user) => {
          socket.emit('online', user);
          socket.join(user!.role);
        })
        .catch((error) => {
          socket.emit('error', error);
        });
    });
    socket.on('error', (error) => {
      logger.error(['error:', error]);
    });

    socket.on('connect_error', (error) => {
      logger.error(['connect_error:', error]);
    });

    socket.on('connect_failed', (error) => {
      logger.error(['connect_failed:', error]);
    });

    socket.on('disconnect', (reason) => {
      this._userService
        .custom()
        .findByIdAndUpdate({ socketId: socket.id }, { online: false, socketId: '' })
        .then((user) => {
          socket.emit('offline', user);
        })
        .catch((error) => {
          socket.emit('error', error);
        });
      logger.info(['disconnect:', reason]);
    });
  };
}
