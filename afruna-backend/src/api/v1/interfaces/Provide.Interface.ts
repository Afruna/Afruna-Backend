/* eslint-disable no-unused-vars */
import { Types } from 'mongoose';

export enum ServiceStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'delete',
}

export interface ProvideInterface {
  vendorId: string | Types.ObjectId;
  name: string;
  categoryId: string | Types.ObjectId;
  state: string;
  country: string;
  desc: string;
  price: number;
  additionalService: { service: string; price: number }[];
  providerId: string;
  verified: boolean;
  availability: {
    days: string[];
    hours: {
      from: number;
      to: number;
    };
  };
  photos: string[];
  tags: string[];
  licenseAndCertification: string[];
  insuranceCoverage: string[];
  publish: boolean;
  blocked: boolean;
  negotiable: boolean;
  ratings: number;
  ratedBy: number;
  status: ServiceStatusEnum;
  booked: number;
}
