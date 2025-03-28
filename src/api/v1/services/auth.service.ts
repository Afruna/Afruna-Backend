/* eslint-disable indent */
/* eslint-disable no-useless-catch */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { UserInterface, UserRole } from '@interfaces/User.Interface';
import HttpError from '@helpers/HttpError';
import * as Config from '@config';
import generateToken, { getSignedToken } from '@utils/generateToken';
import Service from '@services/service';
import AuthSessionRepository from '@repositories/AuthSession.repo';
import { google } from 'googleapis';
import queryString from 'qs';
import axios from 'axios';
import appleSignin, { AppleIdTokenType } from 'apple-signin-auth';
import Emailing from '@helpers/mailer';
import jwt from 'jsonwebtoken';
import { AuthSessionInterface } from '@interfaces/AuthSession.Interface';
import UserService from '@services/user.service';
// import bcrypt from 'bcrypt';
import { logger } from '@utils/logger';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import TokenService from './token.service';
import dayjs from 'dayjs';
import { TokenInterface, TokenTypeEnum } from '@interfaces/Token.Interface';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { JWT_KEY, MESSAGES } from '@config';

class AuthService extends Service<AuthSessionInterface, AuthSessionRepository> {
  protected repository = new AuthSessionRepository();
  private readonly _userService = UserService.instance;
  private readonly _tokenService = TokenService.instance;
  private readonly _emailing = Emailing;
  // externalServices = { SessionService: new SessionService(), Emailing: new Emailing() };
  useSessions = Config.OPTIONS.USE_AUTH_SESSIONS;
  useRefreshToken = Config.OPTIONS.USE_REFRESH_TOKEN;
  useGoogle = Config.OPTIONS.USE_OAUTH_GOOGLE;
  useFacebook = Config.OPTIONS.USE_OAUTH_FACEBOOK;
  useApple = Config.OPTIONS.USE_OAUTH_APPLE;

  oAuth2Client = this.useGoogle
    ? new google.auth.OAuth2(
        Config.GOOGLE_API_CLIENT_ID,
        Config.GOOGLE_API_CLIENT_SECRET,
        `${Config.GOOGLE_API_REDIRECT}`,
      )
    : null;

  oauth2 = this.useGoogle ? google.oauth2('v2') : null;

  appleOptions = this.useApple
    ? {
        clientID: Config.APPLE_API_CLIENT_ID || 'com.company.app',
        redirectUri: Config.APPLE_API_REDIRECT,
        // OPTIONAL
        state: 'state', // optional, An unguessable random string. It is primarily used to protect against CSRF attacks.
        // responseMode: 'form_post', // Force set to form_post if scope includes 'email'
        scope: 'name%20email',
        // scope: ['name', 'email'], // optional
      }
    : null;

  private static _instance: AuthService;

  async login(data: { email: string; password: string }) {
    try {
      const user = await this._userService().findOne({ email: <string>data.email });
      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);
      const isMatch = await this.comparePasswords(data.password, user);
      if (!isMatch) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);
      const token = this.getSignedToken(user);

      if (user.blocked) throw new HttpError('you have been blocked. contact the admin', 401);

      // create a session
      let session = await this.findOne({ userId: user._id });
      if (session) this.delete(session._id);
      session = await this.create({
        userId: user._id,
        token,
        isLoggedIn: true,
      });

      let refreshToken;
      if (this.useRefreshToken) {
        refreshToken = this.getRefreshToken(session);
      }

      return { token, user, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  async socialLogin(user: DocType<UserInterface>) {
    try 
    {
      
      const token = getSignedToken(user);

      // create a session
      let session = await this.findOne({ userId: <string>user._id });
      if (session) this.delete(session._id);
      session = await this.create({
        userId: <string>user._id,
        token,
        isLoggedIn: true,
      });

      let refreshToken;
      if (this.useRefreshToken) {
        refreshToken = this.getRefreshToken(session);
      }

      return { token,refreshToken };
    } catch (error) {
      throw error;
    }
  }

  async validateToken(token: string) {
    try 
    {
      
      const decoded = <any>jwt.verify(token, JWT_KEY);

      const user = await this._userService().findOne(<string>decoded.id);

      if (!user) {
        throw new HttpError(MESSAGES.UNAUTHORIZED, 401);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async createUser(data: Partial<UserInterface>, role = UserRole.USER) {
    let user = null;
    try 
    {
      user = await this._userService().findOne({ email: <string>data.email });
      if (user) 
      {
        if(user.verifiedEmail || user.phoneNumber === data.phoneNumber)
          throw new HttpError(Config.MESSAGES.USER_EXISTS, 406);
      }
      else
      {
        data.role = role;
        data.isProvider = role === UserRole.PROVIDER;
        data.isVendor = role === UserRole.VENDOR;
        data.password = await this.toHash(data.password!);
        user = await this._userService().create(data);
      }
        

      

      // create email verification token
      const code = generateToken();
      const token = await this._tokenService().create({
        code,
        expiresAt: dayjs().add(30, 'minute').toDate(),
        user: user._id,
        type: TokenTypeEnum.VERIFY_EMAIL,
      });

      this._emailing
        ? this._emailing.verifyEmail(<DocType<TokenInterface & { user: DocType<UserInterface> }>>token)
        : logger.info(['email not enabled']);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getVerificationToken(email: string) {
    try {
      let token;

      const user = await this._userService().findOne({ email });
      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 400);
      if (user.verifiedEmail) throw new HttpError('email is already verified', 400);

      const existingToken = await this._tokenService().findOne({
        user: user._id,
        type: TokenTypeEnum.VERIFY_EMAIL,
      });

      if (existingToken && dayjs(existingToken.expiresAt) > dayjs()) {
        token = existingToken;
      } else {
        if (existingToken) await this._tokenService().delete(existingToken._id);

        const code = generateToken();
        token = await this._tokenService().create({
          code,
          expiresAt: dayjs().add(30, 'minute').toDate(),
          user: user._id,
          type: TokenTypeEnum.VERIFY_EMAIL,
        });
      }

      

      this._emailing
        ? this._emailing.verifyEmail(<DocType<TokenInterface & { user: DocType<UserInterface> }>>token)
        : logger.info(['email not enabled']);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token: string) {
    try {
      const tokenDoc = <DocType<TokenInterface & { user: DocType<UserInterface> }>>await this._tokenService().findOne({
        code: token,
        expiresAt: <any>{ $gt: new Date() },
      });
      if (!tokenDoc) throw new HttpError(Config.MESSAGES.INVALID_TOKEN, 406);
      await this._tokenService().delete(tokenDoc._id);

      const result = await this._userService().update(<string>tokenDoc.user._id, { verifiedEmail: true });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getResetToken(email: string) {
    try {
      let token;

      const user = await this._userService().findOne({ email });
      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 404);

      const existingToken = await this._tokenService().findOne({
        user: user._id,
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
          user: user._id,
          type: TokenTypeEnum.RESET_PASSWORD,
        });
      }

      this._emailing
        ? this._emailing.sendResetPassword(<DocType<TokenInterface & { user: DocType<UserInterface> }>>token)
        : logger.info(['email not enabled']);
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      const tokenDoc = <DocType<TokenInterface & { user: DocType<UserInterface> }>>await this._tokenService().findOne({
        code: token,
        expiresAt: <any>{ $gt: new Date() },
      });
      if (!tokenDoc) throw new HttpError(Config.MESSAGES.INVALID_TOKEN, 406);
      await this._tokenService().delete(tokenDoc._id);

      await this._userService().update(tokenDoc.user._id, { password: await this.toHash(password!) });
      return;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(userId: string, oldPassword: string, password: string) {
    try {
      const user = await this._userService().findOne(userId);

      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 404);
      const isMatch = await this.comparePasswords(oldPassword, user);

      if (!isMatch) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);

      await this._userService().update(user._id, { password: await this.toHash(password!) });
      return;
    } catch (error) {
      throw error;
    }
  }

  oAuthUrls(state = '') {
    let googleLoginUrl = '';
    let facebookLoginUrl = '';
    let appleLoginUrl = '';

    if (this.useGoogle) {
      googleLoginUrl = this.oAuth2Client!.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
        state,
      });
    }

    if (this.useFacebook) {
      const stringifiedParams = queryString.stringify({
        client_id: Config.FACEBOOK_API_CLIENT_ID,
        redirect_uri: Config.FACEBOOK_API_REDIRECT,
        scope: ['email', 'user_friends'].join(','),
        response_type: 'code',
        auth_type: 'rerequest',
        display: 'popup',
      });

      facebookLoginUrl = `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`;
    }

    if (this.useApple) {
      appleLoginUrl = appleSignin.getAuthorizationUrl(this.appleOptions!);
    }

    return { googleLoginUrl, facebookLoginUrl, appleLoginUrl };
  }

  async googleLogin(code: string, state: string) {
    try {
      if (!this.oAuth2Client || !this.oauth2) return null;
      const { tokens } = await this.oAuth2Client.getToken(code);
      this.oAuth2Client.credentials = tokens;

      const {
        // eslint-disable-next-line no-unused-vars, camelcase, object-curly-newline
        data: { email, id, given_name, family_name, picture },
      } = await this.oauth2.userinfo.v2.me.get({
        auth: this.oAuth2Client,
      });

      const user = await this._userService().update(
        { email: <string>email },
        {
          email: <string>email,
          $setOnInsert: {
            fromOauth: false,
            verifiedEmail: true,
            firstName: given_name!,
            lastName: family_name!,
            avatar: picture || '',
            role: UserRole.USER,
          },
        },
        true,
      );
      const token = this.getSignedToken(user!);
      return `${state}?token=${token}`;
    } catch (error) {
      throw error;
    }
  }

  async facebookLogin(code: string) {
    try {
      if (!this.useFacebook) return null;
      // eslint-disable-next-line no-unused-vars
      const { access_token, token_type, expires_in } = (
        await axios<{ access_token: string; token_type: string; expires_in: string }>({
          url: 'https://graph.facebook.com/v4.0/oauth/access_token',
          method: 'get',
          params: {
            client_id: Config.FACEBOOK_API_CLIENT_ID,
            client_secret: Config.FACEBOOK_API_CLIENT_SECRET,
            redirect_uri: Config.FACEBOOK_API_REDIRECT,
            code,
          },
        })
      ).data;
      // eslint-disable-next-line no-unused-vars, object-curly-newline
      const { id, email, first_name, last_name } = (
        await axios<{ id: string; email: string; first_name: string; last_name: string }>({
          url: 'https://graph.facebook.com/me',
          method: 'get',
          params: {
            fields: ['id', 'email', 'first_name', 'last_name'].join(','),
            access_token,
          },
        })
      ).data;
      const user = await this._userService().update({ email: <string>email }, { email: <string>email }, true);
      const token = this.getSignedToken(user!);
      return `${Config.FRONTEND_FACEBOOK_LOGIN_URI}?token=${token}`;
    } catch (error) {
      throw error;
    }
  }

  async appleLogin(code: string) {
    try {
      if (!this.useApple) return null;

      const appleClientSecret = appleSignin.getClientSecret({
        clientID: Config.APPLE_API_CLIENT_ID || 'com.company.app', // Apple Client ID
        teamID: Config.APPLE_TEAM_ID || 'teamID', // Apple Developer Team ID.
        privateKey: Config.APPLE_API_CLIENT_SECRET,
        keyIdentifier: Config.APPLE_KEY_IDENTIFIER,
        // OPTIONAL
        expAfter: 15777000,
      });
      const appleGetTokenOptions = {
        clientID: Config.APPLE_API_CLIENT_ID || 'com.company.app',
        redirectUri: Config.APPLE_API_REDIRECT,
        clientSecret: appleClientSecret,
      };
      const { id_token } = await appleSignin.getAuthorizationToken(code, appleGetTokenOptions);

      // eslint-disable-next-line no-unused-vars
      const { email, name } = <AppleIdTokenType & { name: string }>await appleSignin.verifyIdToken(id_token);

      const user = await this._userService().update({ email: <string>email }, { email: <string>email }, true);
      const token = this.getSignedToken(user!);
      return `${Config.FRONTEND_FACEBOOK_LOGIN_URI}?token=${token}`;
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      if (!this.useRefreshToken) throw new Error(Config.MESSAGES.INVALID_SESSION);
      const id = (<{ id: string }>jwt.verify(refreshToken, Config.REFRESH_JWT_KEY)).id;
      const session = await this.findOne(id);
      if (!session) throw new Error(Config.MESSAGES.INVALID_SESSION);
      const user = await this._userService().findOne(<string>session.userId);
      const token = this.getSignedToken(user!);
      await this.update(session._id, { token });
      return { token };
    } catch (error) {
      throw error;
    }
  }

  getSignedToken(user: DocType<UserInterface>) {
    return jwt.sign({ id: user._id }, Config.JWT_KEY, { expiresIn: Config.JWT_TIMEOUT });
  }

  async newSession(user: UserInterface & { _id: string; token: string }) {
    let session = await this.findOne({ userId: user._id });
    if (session) this.delete(session._id);
    session = await this.create({
      userId: user._id,
      token: user.token,
      isLoggedIn: true,
    });
  }

  getRefreshToken = (session: DocType<AuthSessionInterface>) => {
    return jwt.sign({ id: session._id }, Config.REFRESH_JWT_KEY, { expiresIn: Config.REFRESH_JWT_TIMEOUT });
  };

  toHash = async (password: string) => {
    const salt = randomBytes(8).toString('hex');
    const buf = <Buffer>await promisify(scrypt)(password, salt, 64);
    return `${buf.toString('hex')}.${salt}`;
  };

  comparePasswords = async (password: string, user: UserInterface) => {
    const [hashPassword, salt] = user.password.split('.');
    const buf = <Buffer>await promisify(scrypt)(password, salt, 64);
    return buf.toString('hex') === hashPassword;
  };

  newLoginWithGoogle() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: Config.GOOGLE_API_CLIENT_ID,
          clientSecret: Config.GOOGLE_API_CLIENT_SECRET,
          callbackURL: `${Config.GOOGLE_API_REDIRECT}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const { email, given_name: firstName, family_name: lastName, picture: avatar } = profile._json;

            const user = await this._userService().update(
              { email },
              {
                email,
                firstName,
                lastName,
                avatar,
                verifiedEmail: true,
                $setOnInsert: { role: UserRole.USER, fromOauth: true },
              },
              true,
            );

            const token = this.getSignedToken(user!);
            await this.newSession({ ...user.toObject(), token });

            done(null, { token, user });
          } catch (error) {
            done(error, null);
          }
        },
      ),
    );
  }

  static toHash = async (password: string) => {
    const salt = randomBytes(8).toString('hex');
    const buf = <Buffer>await promisify(scrypt)(password, salt, 64);
    return `${buf.toString('hex')}.${salt}`;
  };

  static instance() {
    if (!AuthService._instance) {
      AuthService._instance = new AuthService();
    }
    return AuthService._instance;
  }
}

export default AuthService;
