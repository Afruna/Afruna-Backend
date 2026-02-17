/* eslint-disable no-unused-vars */
import { Request } from 'express';
import AuthService from '@services/auth.service';
import Controller from '@controllers/controller';
import { MESSAGES } from '@config';
import { AuthSessionInterface } from '@interfaces/AuthSession.Interface';
import { AuthResponseDTO } from '@dtos/auth.dto';
import { UserRole } from '@interfaces/User.Interface';
import { AuthVendorSessionInterface } from '@interfaces/AuthVendorSession.Interface';
import VendorService from '@services/vendor.service';
import AuthVendorService from '@services/auth.vendor.service';
import { AuthVendorResponseDTO } from '@dtos/auth.vendor.dto';

class AuthVendorController extends Controller<AuthVendorSessionInterface> {
  responseDTO = undefined;
  service = new AuthVendorService();

  login = this.control(async (req: Request) => {
    return this.service.login(req.body);
  }, AuthVendorResponseDTO.login);

  registration = this.control((req: Request) => {
    return this.service.createVendor(req.body);
  }, AuthVendorResponseDTO.signUp);

  // OTP verification temporarily disabled for vendor signup
  // verificationToken = this.control(async (req: Request) => {
  //   await this.service.getVerificationToken(req.body.email);
  //   return { _message: 'Email Sent' };
  // }, undefined);

  // verifyEmail = this.control(async (req: Request) => {
  //   const result = await this.service.verifyEmail(req.body);
  //   return result;
  // }, AuthVendorResponseDTO.Vendor);

  forgotPassword = this.control(async (req: Request) => {
    await this.service.getResetToken(req.body.email);
    return { _message: 'Email Sent' };
  }, undefined);

  resetPassword = this.control(async (req: Request) => {
    await this.service.resetPassword(req.body);
    return { _message: 'Reset Successful' };
  }, undefined);

  updatePassword = this.control(async (req: Request) => {
    await this.service.updatePassword(req.vendor?._id, req.body.oldPassword, req.body.password);
    return { _message: 'Password Update Successful' };
  }, undefined);


  getRefreshToken = this.control((req: Request) => {
    const token = req.headers['x-refresh-token'];
    if (!token) throw new this.HttpError(MESSAGES.INVALID_REQUEST);
    return this.service.refreshAccessToken(<string>token);
  }, undefined);

  // switchContext = this.control((req: Request) => {
  //   return this.service.createUser(req.body, true);
  // }, AuthResponseDTO.signUp);
}

export default AuthVendorController;
