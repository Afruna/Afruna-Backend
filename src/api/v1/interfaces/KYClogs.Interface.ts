import { Types } from 'mongoose';

export enum KYCType {
  GENERAL = 'general',
  BUSINESS_INFO = 'business_info',
  SHIPPING_INFO = 'shipping_info',
  LEGAL_REP = 'legal_rep',
  PAYMENT_INFO = 'payment_info',
  MEANS_IDENTIFICATION = 'means_identification'
}

export enum KYCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface KYClogsInterface {
  vendorId: Types.ObjectId;
  status: KYCStatus;
  message?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  businessDetailStatus?: boolean;
  businessInfoStatus?: boolean;
  shippingInfoStatus?: boolean;
  legalRepStatus?: boolean;
  paymentInfoStatus?: boolean;
  meansIdentificationStatus?: boolean;
  customerCareStatus?: boolean;
  additionalInfoStatus?: boolean;
  storeFrontStatus?: boolean;
} 