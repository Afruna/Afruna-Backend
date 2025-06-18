import { Types } from 'mongoose';

export enum TransactionEvent {
  CREDITED = 'Credited',
  WITHDRAWAL = 'Withdrawal',
  LISTING_FEE = 'Listing Fee',
  PAYMENT = 'Payment',
}

export enum PaymentMethod {
    CARD = 'CARD',
    WALLET = 'WALLET',
    ON_DELIVERY = 'ON_DELIVERY'
}

export interface TransactionInterface {
  success: boolean;
  userId: string | Types.ObjectId;
  source: 'service' | 'marketplace';
  event: TransactionEvent;
  amount: number;
  date: Date;
  description: string;
  paymentMethod?: PaymentMethod; // Necessary when event is equal to Payment
  reference: string;
  customId?: string;
}
