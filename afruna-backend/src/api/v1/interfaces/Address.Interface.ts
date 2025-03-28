import { Types } from "mongoose";

export interface AddressInterface {
    _id?: string | Types.ObjectId;
    userId: string | Types.ObjectId;
    name: string;
    address: string;
    streetNumber: string;
    phoneNumber: string;
    postCode: string
    city: string;
    state: string;
    country?: string;
    isDefault?: boolean;
  }