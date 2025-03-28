import { Types } from "mongoose";

export interface DepositInterface {
    _id?: string | Types.ObjectId;
    userId: string | Types.ObjectId; //
    amount: number;
    transactionReference: string;
    createdAt: Date;
    status: DEPOSIT_STATUS;
}

export enum DEPOSIT_STATUS {
    PENDING = "PENDING",
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED"
}