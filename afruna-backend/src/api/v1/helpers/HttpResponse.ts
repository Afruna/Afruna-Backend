import { Response } from 'express';
import httpStatus from 'http-status';

export default class HttpResponse {
  static send(res: Response, data: object, status = 200) {
    res.status(status);

    if (data && typeof data === 'object' && 'limit' in data) {
      return res.json({
        success: true,
        message: (httpStatus as any)[status],
        ...data,
      });
    }
    return res.json({
      success: true,
      message: (httpStatus as any)[status],
      data,
    });
  }
}
