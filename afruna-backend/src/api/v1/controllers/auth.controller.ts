/* eslint-disable no-unused-vars */
import { NextFunction, Request } from 'express';
import AuthService from '@services/auth.service';
import Controller from '@controllers/controller';
import { MESSAGES } from '@config';
import { AuthSessionInterface } from '@interfaces/AuthSession.Interface';
import { AuthResponseDTO } from '@dtos/auth.dto';
import { UserRole } from '@interfaces/User.Interface';
import passport from 'passport';
import { passportConfig } from 'src/config/passport.config';
import { getSignedToken } from '@utils/generateToken';

class AuthController extends Controller<AuthSessionInterface> {
  responseDTO = undefined;
  service = new AuthService();

  validateToken = this.control((req: Request) => {
    const token = req.body.token;
    return this.service.validateToken(token);
  });

  login = this.control(async (req: Request) => {
    return this.service.login(req.body);
  }, AuthResponseDTO.login);

  registration = this.control((req: Request) => {
    return this.service.createUser(req.body);
  }, AuthResponseDTO.signUp);

  verificationToken = this.control(async (req: Request) => {
    await this.service.getVerificationToken(req.body.email);
    return { _message: 'Email Sent' };
  }, undefined);

  sellerRegistration = this.control((req: Request) => {
    return this.service.createUser(req.body, UserRole.VENDOR);
  }, AuthResponseDTO.signUp);

  providerRegistration = this.control((req: Request) => {
    return this.service.createUser(req.body, UserRole.PROVIDER);
  }, AuthResponseDTO.signUp);

  verifyEmail = this.control(async (req: Request) => {
    const result = await this.service.verifyEmail(req.body.token);
    return result;
  }, AuthResponseDTO.User);

  forgotPassword = this.control(async (req: Request) => {
    await this.service.getResetToken(req.body.email);
    return { _message: 'Email Sent' };
  }, undefined);

  resetPassword = this.control(async (req: Request) => {
    await this.service.resetPassword(req.params.token, req.body.password);
    return { _message: 'Reset Successful' };
  }, undefined);

  updatePassword = this.control(async (req: Request) => {
    await this.service.updatePassword(req.user?._id, req.body.oldPassword, req.body.password);
    return { _message: 'Reset Successful' };
  }, undefined);

  oAuthUrls = this.control(async (req: Request) => {
    const result = this.service.oAuthUrls(req.query.url === 'localhost' ? 'localhost:3000' : <string>req.query.url);
    return { success: true, message: 'OK', data: result };
  }, undefined);

  googleLogin = this.control(async (req: Request) => {
    const { code, state } = req.query;
    const redirectUri = await this.service.googleLogin(<string>code, <string>state);
    return { redirectUri, redirect: true };
  });

  facebookLogin = this.control(async (req: Request) => {
    const { code } = req.query;
    const redirectUri = await this.service.facebookLogin(<string>code);
    return { redirectUri, redirect: true };
  });

  appleLogin = this.control(async (req: Request) => {
    const { code } = req.query;
    const redirectUri = await this.service.appleLogin(<string>code);
    return { redirectUri, redirect: true };
  });

  getRefreshToken = this.control((req: Request) => {
    const token = req.headers['x-refresh-token'];
    if (!token) throw new this.HttpError(MESSAGES.INVALID_REQUEST);
    return this.service.refreshAccessToken(<string>token);
  }, undefined);

  newGoogleLogin = async(req, res) => {
    // Successful authentication, redirect home.
    console.log("Callback User", req?.user)
    const payLoad = await this.service.socialLogin(req?.user)
    res.redirect(`https://www.afruna.com/?token=${payLoad.token}&refreshToken=${payLoad.refreshToken}`);
  }

  socialLogout = async(req, res, next) => {
    // Successful authentication, redirect home.
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect(`https://www.afruna.com/`);
    });
    // req.logout(function(err) {
    //   if (err) { return next(err); }
    //   res.redirect(`https://www.afruna.com/`);
    // });
    
  }

  // switchContext = this.control((req: Request) => {
  //   return this.service.createUser(req.body, true);
  // }, AuthResponseDTO.signUp);
}

export default AuthController;
