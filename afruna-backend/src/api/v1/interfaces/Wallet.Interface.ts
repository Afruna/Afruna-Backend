import { Types } from 'mongoose';

export interface BankAccountInterface {
  _id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  recipientCode?: string;
}
export interface WalletInterface {
  _id?: string;
  balance?: number;
  ledgerBalance?: number;
  userId?: string | Types.ObjectId;
  vendorId?: string | Types.ObjectId;
  accounts?: BankAccountInterface[];
}
