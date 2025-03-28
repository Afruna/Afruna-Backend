/* eslint-disable no-underscore-dangle */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import HttpError from '@helpers/HttpError';
import { MESSAGES, JWT_KEY, OPTIONS } from '@config';
import UserRepository from '@repositories/User.repository';
import SessionRepository from '@repositories/AuthSession.repo';
import { logger } from '@utils/logger';
import VendorRepository from '@repositories/Vendor.repo';
import AuthVendorSessionRepository from '@repositories/AuthVendorSession.repo';

const sessionService = new SessionRepository();
const userService = new UserRepository();

//Vendor
const vendorSessionService = new AuthVendorSessionRepository();
const vendorService = new VendorRepository();

// eslint-disable-next-line import/prefer-default-export
export const authorize =
  // eslint-disable-next-line consistent-return
  (role?: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log( req.headers.authorization)
      const token =
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'
          ? req.headers.authorization.split(' ')[1]
          : null;

      if (!token) {
        return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
      }

      const decoded = <any>jwt.verify(token, JWT_KEY);
      console.log(decoded)
      const user = await userService.findOne(<string>decoded.id);
console.log(user)
      if (!user) {
        return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
      }

      // if (OPTIONS.USE_AUTH_SESSIONS) {
      //   const session = await sessionService.findOne({ userId: user._id });
      //   if (!session) return next(new HttpError(MESSAGES.INVALID_SESSION, 401));
      //   if (session.token !== token) return next(new HttpError(MESSAGES.ACTIVE_SESSION, 401));
      // }

      if (role && user.role !== role) {
        return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
      }
      req.user = user;

      // if (OPTIONS.USE_ANALYTICS && !(<any>req.session).userId) {
      //   (<any>req.session).userId = user._id;
      //   req.session.save();
      // }

      return next();
    } catch (error) {
      return next(new HttpError(`${error}`, 401));
    }
  };

  export const authorizeVendor =
  // eslint-disable-next-line consistent-return
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'
          ? req.headers.authorization.split(' ')[1]
          : null;

      if (!token) {
        return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
      }

      const decoded = <any>jwt.verify(token, JWT_KEY);

      const vendor = await vendorService.findOne(<string>decoded.id);

      if (!vendor) {
        return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
      }

      if (OPTIONS.USE_AUTH_SESSIONS) {
        const session = await vendorSessionService.findOne({ vendorId: vendor._id });
        if (!session) return next(new HttpError(MESSAGES.INVALID_SESSION, 401));
        if (session.token !== token) return next(new HttpError(MESSAGES.ACTIVE_SESSION, 401));
      }

      req.vendor = vendor;

      // if (OPTIONS.USE_ANALYTICS && !(<any>req.session).userId) {
      //   (<any>req.session).userId = user._id;
      //   req.session.save();
      // }

      return next();
    } catch (error) {
      return next(new HttpError(`${error}`, 401));
    }
  };

export const getUserIfExist =
  // eslint-disable-next-line consistent-return
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      let decoded: any;
      const token =
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'
          ? req.headers.authorization.split(' ')[1]
          : null;

      if (!token) {
        return next();
      }

      try {
        decoded = jwt.verify(token, JWT_KEY);
      } catch (error) {}

      if (!decoded) {
        return next();
      }

      const user = await userService.findOne(<string>decoded.id);

      if (!user) {
        return next();
      }

      req.user = user;

      return next();
    } catch (error) {
      next(error);
    }
  };


  export const getVendorIfExist =
  // eslint-disable-next-line consistent-return
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      let decoded: any;
      const token =
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'
          ? req.headers.authorization.split(' ')[1]
          : null;

      if (!token) {
        return next();
      }

      try {
        decoded = jwt.verify(token, JWT_KEY);
      } catch (error) {}

      if (!decoded) {
        return next();
      }

      const vendor = await vendorService.findOne(<string>decoded.id);

      if (!vendor) {
        return next();
      }

      req.vendor = vendor;

      return next();
    } catch (error) {
      next(error);
    }
  };


  export const authenticateUserOrVendor =
    // eslint-disable-next-line consistent-return
    () => async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token =
          req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'
            ? req.headers.authorization.split(' ')[1]
            : null;

        if (!token) {
          return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
        }

        let decoded: any;
        try {
          decoded = jwt.verify(token, JWT_KEY);
        } catch (error) {
          return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
        }

        const user = await userService.findOne(<string>decoded.id);
        if (user) {
          req.user = user;
          return next();
        }

        const vendor = await vendorService.findOne(<string>decoded.id);
        if (vendor) {
          req.vendor = vendor;
          return next();
        }

        return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
      } catch (error) {
        return next(new HttpError(`${error}`, 401));
      }
    };