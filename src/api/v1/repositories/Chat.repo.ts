import { ChatInterface } from '@interfaces/Chat.Interface';
import Chat from '@models/Chat';
import Repository from '@repositories/repository';

export default class ChatRepository extends Repository<ChatInterface> {
  protected model = Chat;
}
