import HttpError from '@helpers/HttpError';
import Service from '@services/service';
import * as Config from '@config';
import VendorRepository from '@repositories/Vendor.repo';
import { VendorInterface, VendorStatus } from '@interfaces/Vendor.Interface';
import { TokenInterface, TokenTypeEnum } from '@interfaces/Token.Interface';
import jwt from 'jsonwebtoken';
import { logger } from '@utils/logger';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import dayjs from 'dayjs';
import Emailing from '@helpers/vendor.mailer';
import AuthVendorSessionRepository from '@repositories/AuthVendorSession.repo';
import VendorTokenService from './vendor.token.service';
import generateToken from '@utils/generateToken';
import { VendorTokenInterface } from '@interfaces/VendorToken.Interface';
import { AuthVendorSessionInterface } from '@interfaces/AuthVendorSession.Interface';
import VendorService from './vendor.service';
import { SendMail } from 'src/config/email.config';

class AuthVendorService extends Service<AuthVendorSessionInterface, AuthVendorSessionRepository> {
  protected repository = new AuthVendorSessionRepository();
  protected repositoryAuthSession = new AuthVendorSessionRepository();
  private readonly _vendorService = VendorService.instance;
  private readonly _tokenService = VendorTokenService.instance;
  private static _instance: AuthVendorService;
  private readonly _emailing = Emailing;
  useSessions = Config.OPTIONS.USE_AUTH_SESSIONS;
  useRefreshToken = Config.OPTIONS.USE_REFRESH_TOKEN;

 async login(data: { email: string; password: string }) {
    try {
      const verifiedEmail = true;
      // check if the vendor is verified
      const vendor = await this._vendorService().findOne({ emailAddress: <string>data.email });
      if (!vendor) throw new HttpError(Config.MESSAGES.INVALID_VENDOR_ACCOUNT, 401);
      const isMatch = await this.comparePasswords(data.password, vendor);
      if (!isMatch) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);
      const token = this.getSignedToken(vendor);

      if (vendor.blocked) throw new HttpError('you have been blocked. contact the admin', 401);

      // create a session
      let session = await this.repositoryAuthSession.findOne({ vendorId: vendor._id });
      if (session) this.delete(session._id);
      session = await this.repositoryAuthSession.create({
        vendorId: vendor._id,
        token,
        isLoggedIn: true,
      });

      let refreshToken;
      if (this.useRefreshToken) {
        refreshToken = this.getRefreshToken(session);
      }

      return { token, vendor, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  async createVendor(data: Partial<VendorInterface>) {

    let vendor = null;

    const verifiedEmail = true;

    try 
    {
      vendor = await this._vendorService().findOne({ emailAddress: <string>data.emailAddress });
      if (vendor) 
      {
        if(vendor.verifiedEmail)
          throw new HttpError(Config.MESSAGES.VENDOR_EXISTS, 406);
      }
      else
      {
        data.password = await this.toHash(data.password!);
        vendor = await this._vendorService().create(data);
      }
        

      

      // create email verification token
      const code = generateToken();
      const token = await this._tokenService().create({
        code,
        expiresAt: dayjs().add(30, 'minute').toDate(),
        vendor: vendor._id,
        type: TokenTypeEnum.VERIFY_EMAIL,
      });
      
      

      this._emailing
        ? this._emailing.verifyEmail(<DocType<VendorTokenInterface & { vendor: DocType<VendorInterface> }>>token)
        : logger.info(['email not enabled']);
      return vendor;
    } catch (error) {
      throw error;
    }
  }

  async getVerificationToken(emailAddress: string) {
    try {
      let token;

      const vendor = await this._vendorService().findOne({ emailAddress });
      if (!vendor) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 400);
      if (vendor.verifiedEmail) throw new HttpError('email is already verified', 400);

      const existingToken = await this._tokenService().findOne({
        vendor: vendor._id,
        type: TokenTypeEnum.VERIFY_EMAIL,
      });

      if (existingToken && dayjs(existingToken.expiresAt) > dayjs()) {
        token = existingToken;
      } else {
        if (existingToken) await this._tokenService().delete(existingToken._id);

        const code = generateToken();
        console.log("Code:", code)
        token = await this._tokenService().create({
          code,
          expiresAt: dayjs().add(30, 'minute').toDate(),
          vendor: vendor._id,
          type: TokenTypeEnum.VERIFY_EMAIL,
        });
      }

      this._emailing
        ? this._emailing.verifyEmail(<DocType<VendorTokenInterface & { vendor: DocType<VendorInterface> }>>token)
        : logger.info(['email not enabled']);

      return vendor;
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(data: {email: string, token: string }) {
    try {
      const tokenDoc = <DocType<VendorTokenInterface & { vendor: DocType<VendorInterface> }>>await this._tokenService().findOne({
        code: data.token,
        expiresAt: <any>{ $gt: new Date() },
      });
      if (!tokenDoc) throw new HttpError(Config.MESSAGES.INVALID_TOKEN, 406);
      await this._tokenService().delete(tokenDoc._id);

      const result = await this._vendorService().update(<string>tokenDoc.vendor._id, { verifiedEmail: true, status: VendorStatus.ACTIVE });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getResetToken(emailAddress: string) {
    try {
      let token;

      const vendor = await this._vendorService().findOne({ emailAddress });
      if (!vendor) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 404);

      const existingToken = await this._tokenService().findOne({
        vendor: vendor._id,
        type: TokenTypeEnum.RESET_PASSWORD,
      });

      if (existingToken && dayjs(existingToken.expiresAt) > dayjs()) {
        token = existingToken;
      } else {
        if (existingToken) await this._tokenService().delete(existingToken._id);

        const code = generateToken();
        token = await this._tokenService().create({
          code,
          expiresAt: dayjs().add(30, 'minute').toDate(),
          vendor: vendor._id,
          type: TokenTypeEnum.RESET_PASSWORD,
        });
      }

      this._emailing
        ? this._emailing.sendResetPassword(<DocType<VendorTokenInterface & { vendor: DocType<VendorInterface> }>>token)
        : logger.info(['email not enabled']);
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(data: { token: string, password: string }) {
    try {
      const tokenDoc = <DocType<VendorTokenInterface & { vendor: DocType<VendorInterface> }>>await this._tokenService().findOne({
        code: data.token,
        expiresAt: <any>{ $gt: new Date() },
      });
      if (!tokenDoc) throw new HttpError(Config.MESSAGES.INVALID_TOKEN, 406);
      await this._tokenService().delete(tokenDoc._id);

      await this._vendorService().update(tokenDoc.vendor._id, { password: await this.toHash(data.password!) });
      return;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(vendorId: string, oldPassword: string, password: string) {
    try {
      const vendor = await this._vendorService().findOne({ _id: <string>vendorId });
      

      if (!vendor) throw new HttpError(Config.MESSAGES.INVALID_VENDOR_ACCOUNT, 404);
      const isMatch = await this.comparePasswords(oldPassword, vendor);

      if (!isMatch) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);

      await this._vendorService().update(vendor._id, { password: await this.toHash(password!) });
      return;
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      if (!this.useRefreshToken) throw new Error(Config.MESSAGES.INVALID_SESSION);
      const id = (<{ id: string }>jwt.verify(refreshToken, Config.REFRESH_JWT_KEY)).id;
      const session = await this.repositoryAuthSession.findOne(id);
      if (!session) throw new Error(Config.MESSAGES.INVALID_SESSION);
      const user = await this._vendorService().findOne(<string>session.vendorId);
      const token = this.getSignedToken(user!);
      await this.repositoryAuthSession.update(session._id, { token });
      return { token };
    } catch (error) {
      throw error;
    }
  }

  getSignedToken(vendor: DocType<VendorInterface>) {
    return jwt.sign({ id: vendor._id }, Config.JWT_KEY, { expiresIn: Config.JWT_TIMEOUT });
  }

  async newSession(vendor: VendorInterface & { _id: string; token: string }) {
    let session = await this.repositoryAuthSession.findOne({ vendorId: vendor._id });
    if (session) this.repositoryAuthSession.delete(session._id);
    session = await this.repositoryAuthSession.create({
      vendorId: vendor._id,
      token: vendor.token,
      isLoggedIn: true,
    });
  }

  getRefreshToken = (session: DocType<AuthVendorSessionInterface>) => {
    return jwt.sign({ id: session._id }, Config.REFRESH_JWT_KEY, { expiresIn: Config.REFRESH_JWT_TIMEOUT });
  };

  toHash = async (password: string) => {
    const salt = randomBytes(8).toString('hex');
    const buf = <Buffer>await promisify(scrypt)(password, salt, 64);
    return `${buf.toString('hex')}.${salt}`;
  };

  comparePasswords = async (password: string, vendor: VendorInterface) => {
    const [hashPassword, salt] = vendor.password.split('.');
    const buf = <Buffer>await promisify(scrypt)(password, salt, 64);
    return buf.toString('hex') === hashPassword;
  };

  static toHash = async (password: string) => {
    const salt = randomBytes(8).toString('hex');
    const buf = <Buffer>await promisify(scrypt)(password, salt, 64);
    return `${buf.toString('hex')}.${salt}`;
  };

  static instance() {
    if (!AuthVendorService._instance) {
      AuthVendorService._instance = new AuthVendorService();
    }
    return AuthVendorService._instance;
  }
}

export default AuthVendorService;
