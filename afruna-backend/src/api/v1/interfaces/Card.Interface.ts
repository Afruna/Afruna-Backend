import { Types } from "mongoose";

export interface CardInterface {
    _id: string | Types.ObjectId;
    userId: string | Types.ObjectId;
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    isDefault: boolean;
  }