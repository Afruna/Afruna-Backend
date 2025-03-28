import { Types } from 'mongoose';

export enum TokenTypeEnum {
  RESET_PASSWORD = 'reset_password',
  VERIFY_EMAIL = 'verify_email',
}

export interface TokenInterface {
  user: string | Types.ObjectId;
  code: string;
  type: TokenTypeEnum;
  expiresAt: Date;
}
