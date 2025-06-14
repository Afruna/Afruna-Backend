import { Types } from 'mongoose';

export enum PayoutStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum PayoutType {
  SINGLE = 'SINGLE',
  BULK = 'BULK'
}

export enum PayoutMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET'
}

export interface PayoutInterface {
  vendorId: string | Types.ObjectId;
  amount: number;
  status: PayoutStatus;
  type: PayoutType;
  method: PayoutMethod;
  bankDetails?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
  };
  reference: string;
  description?: string;
  approvedBy?: string | Types.ObjectId;
  approvedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  customId?: string;
} 