import { Router } from 'express';
import Controller from '@controllers/controller';
import { validator } from '@middlewares/validator';
import { ValidationChain } from 'express-validator';
import Multer from '@helpers/uploader';
import { authorize, authorizeVendor, getUserIfExist, getVendorIfExist } from '@middlewares/jwt';
import accessControl from '@middlewares/accessControl';
// import dto from '@dtos/dto';

export default abstract class Route<T> {
  readonly router;
  abstract controller: Controller<T>;
  abstract dto?: Record<string, ValidationChain[]> | null;
  readonly validator = validator;
  readonly fileProcessor = Multer;
  readonly authorize = authorize;
  readonly authorizeVendor = authorizeVendor;
  readonly getUser = getUserIfExist;
  readonly getVendor = getVendorIfExist;
  readonly accessControl = accessControl;
  constructor(useAuth = false, role: string | undefined = undefined) {
    this.router = Router();
    if (useAuth) {
      this.router.use(this.authorize(role));
    }
  }

  abstract initRoutes(): Router;
}
