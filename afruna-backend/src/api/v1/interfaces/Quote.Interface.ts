import { Types } from "mongoose";

export interface QuoteInterface {
    vendorId: string | Types.ObjectId; //
    serviceTitle: string,
    userId: string | Types.ObjectId; //
    serviceId: string | Types.ObjectId; //
    amount: number;
    conversationId: string | Types.ObjectId; //
}