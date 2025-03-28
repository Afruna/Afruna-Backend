import { MessageInterface } from '@interfaces/Messages.Interface';
import Message from '@models/Message';
import Repository from '@repositories/repository';

export default class MessageRepository extends Repository<MessageInterface> {
  protected model = Message;
}
