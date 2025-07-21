import { Types } from 'mongoose';

export interface BannerSliderInterface {
  _id?: string | Types.ObjectId;
  title: string;
  description: string;
  image: string;
  link?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  status?: string;
} 