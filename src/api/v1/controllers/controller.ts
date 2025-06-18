/* eslint-disable indent */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';
import httpResponse from '@helpers/HttpResponse';
import Service from '@services/service';
import httpError from '@helpers/HttpError';
import Multer from '@helpers/uploader';
import safeQuery from '@utils/safeQuery';
import httpStatus from 'http-status';
import { OPTIONS } from '@config';
import Notification from '@models/Notification';
import { SendEmail, SendMail } from '../../../config/email.config';

export default abstract class Controller<T> {
  protected HttpError = httpError;
  protected HttpResponse = httpResponse;
  protected resource;
  protected resourceId;
  protected safeQuery = safeQuery;
  abstract service: Service<T, any>;
  readonly fileProcessor = OPTIONS.USE_MULTER ? Multer : null;
  abstract responseDTO?: Function;

  protected processFile = (req: Request, create = false) => {
    if (!this.fileProcessor) return;
    let multerFile!: 'path' | 'location' | 'buffer';

    if (this.fileProcessor.storageType === 'disk') {
      multerFile = 'path';
    } else if (this.fileProcessor.storageType === 'memory') {
      if (req.file) {
        // const base64String = Buffer.from(req.file.buffer).toString('base64');
        multerFile = 'buffer';
      }
    } else {
      multerFile = 'location';
    }

    if (req.file) {
      if (!req.file.fieldname) return;

      req.body[req.file.fieldname] = (<any>req.file)[multerFile];
    }

    if (req.files && Array.isArray(req.files)) {
      if (req.files.length === 0) return;

      // eslint-disable-next-line no-undef
      const data = (<Express.Multer.File[]>req.files).map((file) => {
        return (<any>file)[multerFile];
      });

      const fieldname = req.files[0].fieldname;

      if (!create) {
        (<any>req.body).$push = {
          [fieldname]: { $each: data },
        };
      } else {
        req.body[fieldname] = data;
      }
    } else if (req.files && !Array.isArray(req.files)) {
      Object.entries(req.files).forEach(([key, value]) => {
        const data = value.map((file) => {
          return (<any>file)[multerFile];
        });

        if (!create) {
          (<any>req.body).$push = {
            [key]: { $each: data },
          };
        } else {
          (<any>req.body)[key] = data;
        }
      });
    }
  };

  protected control =
    (fn: (req: Request) => Promise<any>, responseDTO?: Function) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await fn(req);

        if (result?.redirect) {
          return res.redirect(result.redirectUri);
        }

        const status = req.method === 'POST' ? httpStatus.CREATED : httpStatus.OK;
        responseDTO = responseDTO;
        this.HttpResponse.send(res, responseDTO ? responseDTO(result) : result, status);
      } catch (error) {
        logger.error([error]);
        next(error);
      }
    };

  constructor(resource: string) {
    this.resource = resource;
    this.resourceId = `${resource}Id`;
  }

  create = this.control((req: Request) => {
    this.processFile(req, true);
    const data = <T>req.body;
    return this.service.create(data);
  });

  get = this.control((req: Request) => {
    return this.service.paginatedFind(
      <
        Partial<
          DocType<T> & { page?: string | number | undefined; limit?: string | number | undefined } & {
            $or: any;
            $and: any;
          }
        >
      >safeQuery(req),
    );
  });

  getOne = this.control(async (req: Request) => {
    const result = await this.service.findOne(req.params[this.resourceId]);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  update = this.control(async (req: Request) => {
    let { status, rejectionReason } = req.body;
    console.log(req.body);

    if (status == 'REJECTED') {
      let data: any = await this.service.findOne(req.params[this.resourceId]);
      let vendorId = data.vendorId;
      await this.sendRejectionNotification(vendorId, rejectionReason);
    }

    const result = await this.service.update(req.params[this.resourceId], req.body);

    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  delete = this.control(async (req: Request) => {
    console.log(req.params[this.resourceId]);
    const result = await this.service.delete(req.params[this.resourceId]);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  parseSearchKey(keyword: string, fields: string[]) {
    return {
      $or: fields.map((v) => ({
        [v]: { $regex: keyword, $options: 'i' },
      })),
    };
  }

  parseRangeKeys(min: number | Date, max: number | Date, fields: string[]) {
    return {
      $and: fields.map((f) => ({
        [f]: {
          $gte: min,
          $lte: max,
        },
      })),
    };
  }

  protected capitalizeResourceName(resource: string): string {
    if (!resource) return '';
    
    return resource
      .split(' ')
      .map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  protected async sendRejectionNotification(vendorId: string, rejectionReason: string) {
    let notification = await new Notification({
      vendorId: vendorId,
      subject: `${this.capitalizeResourceName(this.resource)} Rejected`,
      message: rejectionReason
    }).save();
  }
}
