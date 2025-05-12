import { Types } from 'mongoose';

export interface ProductInterface {
  _id: string;
  name: string; //
  desc: string; //
  quantity: number;
  sold: number;
  isOutOfStock: boolean;
  isPromoted: boolean;
  categoryId: string | Types.ObjectId; //
  mainCategoryId: string | Types.ObjectId; //
  price: number;
  discount: number;
  skuNumber: string;
  images: [string];
  coverPhoto: [string];
  ratings: number;
  ratedBy: number;
  vendorId: string | Types.ObjectId;
  vendor: string | Types.ObjectId;
  options: Array<Record<string, string | number> & { quantity: number; availableQuantity: number }>;
  metaData: [string];
  deliveryLocations: [string];
  // discountedPrice(): number;
  customId?: string;
  frequency?: number;
  weight: number;
  hype?: boolean;
  inWishlist?: boolean;
  blocked?: boolean;
  totalScore?: number;
  viewed: Date;
  inCart?: boolean;
  status?: ProductStatus;
  rejectionReason?: String
}


export enum ProductStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED"
};