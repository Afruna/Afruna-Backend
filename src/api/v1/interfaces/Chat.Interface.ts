import { Types } from "mongoose";
import { QuoteInterface } from "./Quote.Interface";

export interface ChatInterface {
    from?: { id: string, name: string, userType: USER_TYPE};
    to?: { id: string, name: string, userType: USER_TYPE};
    content?: string;
    link?: string[];
    messageType?: MESSAGE_TYPE;
    quote?: QuoteInterface;
    quoteData?: Record<string, any>;
}

export enum MESSAGE_TYPE {
    NORMAL = "NORMAL",
    QUOTE = "QUOTE"
}

export enum USER_TYPE {
    VENDOR = "VENDOR",
    USER = "USER"
}