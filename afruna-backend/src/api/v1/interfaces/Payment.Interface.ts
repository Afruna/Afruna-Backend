import { Types } from "mongoose";

export interface PaymentInterface {
    _id?: string | Types.ObjectId;
    userId: string | Types.ObjectId;
    referenceId: string;
    amount: number;
    paymentMethod: PAYMENT_METHOD;
    status: PAYMENT_STATUS;
  }

  export enum PAYMENT_METHOD {
    PAYSTACK = "PAYSTACK"
  }

  export enum PAYMENT_STATUS {
    PENDING = "PENDING",
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED"
  }