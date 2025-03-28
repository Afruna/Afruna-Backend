import { Types } from 'mongoose';

export enum ProductType {
    SERVICE = 'service'
  }

export enum ProductStatus {
    IN_STOCK = 'in-stock',
    OUT_STOCk = 'out-stock'
  }

export interface VendorProductInterface {
  name: string;
  productType: ProductType;
  productStatus: ProductStatus;
  category: string | Types.ObjectId;
  price: number;
  discount: number;
  productDetails: string;
  images: [string];
  ratings: number;
  vendorId: string | Types.ObjectId;
}
