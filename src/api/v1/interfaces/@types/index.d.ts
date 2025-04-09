/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { UserInterface } from '@interfaces/User.Interface';
import { VendorInterface } from '@interfaces/Vendor.Interface';
import { IAdmin } from '@models/Admin';
import { Server } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin & { _id: string | Types.ObjectId };
      user?: UserInterface & { _id: string | Types.ObjectId };
      vendor?: VendorInterface & { _id: string | Types.ObjectId };
      file?: Express.Multer.File & Express.MulterS3.File;
      files?:
        | {
            [fieldname: string]: Multer.File[] & Express.MulterS3.File[];
          }
        | Multer.File[]
        | Express.MulterS3.File[]
        | undefined;
      io: Server;
    }
  }

  type DocType<T> = T & {
    _id: string;
    createdAt: string | object | Date;
    updatedAt: string | object | Date;
    cached?: boolean;
  };

  type PopulateType = {
    path: string;
    model: string;
    select?: string;
    populate?: PopulateType | PopulateType[];
    strictPopulate?: boolean;
  };

  type OptionsParser<T> = {
    sort?: { [key in keyof DocType<T>]?: 1 | -1 };
    limit?: number;
    projection?: Array<keyof DocType<T>>;
    populate?: Array<keyof DocType<T>> | PopulateType;
    multiPopulate?: PopulateType[];
    skip?: number;
    and?: Array<Partial<DocType<T>>>;
    or?: Array<Partial<DocType<T>>>;
    in?: { query: keyof DocType<T>; in: Array<string> };
    all?: { query: [keyof DocType<T>]; all: Array<string> };
  };

  type UpdateData<T> = Partial<T> & {
    load?: { key: string; value: any | any[]; toSet?: boolean };
    unload?: { key: keyof T; value: string | string[]; field?: string };
    increment?: { key: keyof T; value: number };
  };
}

declare module 'express-session' {
  interface SessionData {
    cartId: string;
  }
}

export {};
