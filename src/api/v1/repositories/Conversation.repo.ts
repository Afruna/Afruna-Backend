import { ConversationInterface } from '@interfaces/Conversation.Interface';
import Conversation from '@models/Conversation';
import Repository from '@repositories/repository';

export default class ConversationRepository extends Repository<ConversationInterface> {
  protected model = Conversation;
}
