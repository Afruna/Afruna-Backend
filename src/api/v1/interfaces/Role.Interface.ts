import { UserRole } from './User.Interface';

export type ResourceType =
  | 'booking'
  | 'cart'
  | 'category'
  | 'conversation'
  | 'message'
  | 'order'
  | 'product'
  | 'service'
  | 'review'
  | 'wallet'
  | 'wishlist';

export type RoleInterface = {
  [F in ResourceType]: string[];
};

export type RolesInterface = {
  [F in UserRole]: RoleInterface;
};
