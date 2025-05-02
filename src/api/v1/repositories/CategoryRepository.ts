import { ConversationInterface } from '@interfaces/Conversation.Interface';
import Category, { CategoryInterface } from '@models/Category';
import Conversation from '@models/Conversation';
import Repository from '@repositories/repository';

export default class CategoryRepository extends Repository<CategoryInterface> {
  protected model = Category;
};