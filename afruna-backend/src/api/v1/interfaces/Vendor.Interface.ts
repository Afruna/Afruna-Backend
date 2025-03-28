import mongoose, { Types } from "mongoose";

export enum VendorStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  CANCELED = 'canceled',
  SUBMITTED = 'submitted',
  DRAFT = 'draft'
}

export enum VendorType {
  MARKET_SELLER = 'market_seller',
  SERVICE_PROVIDER = 'service_provider'
}

export interface VendorInterface {
  _id: string;
  businessDetail: string | Types.ObjectId;
  businessAddress: string | Types.ObjectId;
  returnAddress: string | Types.ObjectId;
  customerCareDetail: string | Types.ObjectId;
  legalRep: string | Types.ObjectId;
  paymentInfo: string | Types.ObjectId;
  additionalInfo: string | Types.ObjectId;
  meansOfIdentification: string | Types.ObjectId;
  storeFront: string | Types.ObjectId;
  firstname: string;
  lastname: string;
  emailAddress: string;
  phoneNumber: string;
  shopName: string;
  password: string;
  blocked: boolean;
  verifiedEmail: boolean;
  followers?: any; // TODO:
  following?: any;
  isFollowing?: boolean;
  isFollower?: boolean;
  visits?: number;
  ratings?: number;
  ratedBy: Number,
  vendorType: VendorType;
  status: VendorStatus;
}

export interface IVendorResponseDTO
  extends DocType<
    Pick<
      VendorInterface,
      | 'emailAddress'
      | 'shopName'
      | 'firstname'
      | 'lastname'
      | 'phoneNumber'
      | 'vendorType'
    >
  > {}
