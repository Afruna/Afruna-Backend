export interface ConversationInterface {
  recipients: string[];
  lastMessage: string;
  alias: string;
  aliasAvatar: string;
  unreadMessages: number;
  id?: string;
}
