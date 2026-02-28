import { Types } from "mongoose";

export interface PaymentInterface {
    _id?: string | Types.ObjectId;
    userId: string | Types.ObjectId;
    referenceId: string;
    amount: number;
    type?: PAYMENT_TYPE;
    paymentMethod: PAYMENT_METHOD;
    status: PAYMENT_STATUS;
  }

  export enum PAYMENT_TYPE {
    PRODUCT = 'product',
    SERVICE = 'service',
    WALLET = 'wallet',
  }

  export enum PAYMENT_METHOD {
    PAYSTACK = "PAYSTACK"
  }

  export enum PAYMENT_STATUS {
    PENDING = "PENDING",
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED"
  }