import { Types } from 'mongoose';

export enum BannerSliderType {
  CAROUSEL = 'carousel',
  BANNER = 'banner',
}

export enum BannerSliderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface BannerSliderInterface {
  _id?: string | Types.ObjectId;
  title: string;
  description: string;
  image: string;
  link?: string;
  isActive?: boolean;
  type?: BannerSliderType;
  status?: BannerSliderStatus;
  priority?: number;
  createdAt?: Date;
  updatedAt?: Date;
}