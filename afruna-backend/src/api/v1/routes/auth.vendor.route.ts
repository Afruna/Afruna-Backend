/* eslint-disable import/no-unresolved */
import AuthController from '@controllers/auth.controller';
import Route from '@routes/route';
import { GOOGLE_API_REDIRECT, APPLE_API_REDIRECT, FACEBOOK_API_REDIRECT } from '@config';
import { AuthSessionInterface } from '@interfaces/AuthSession.Interface';
import { AuthVendorSessionInterface } from '@interfaces/AuthVendorSession.Interface';
import AuthVendorController from '@controllers/auth.vendor.controller';
import { authVendorRequestDTO } from '@dtos/auth.vendor.dto';

class AuthVendorRoute extends Route<AuthVendorSessionInterface> {
  controller = new AuthVendorController('authVendorSession');
  dto = authVendorRequestDTO;

  initRoutes() {
    this.router.post('/login', this.validator(this.dto.login), this.controller.login);
    this.router.route('/signup').post(this.validator(this.dto.register), this.controller.registration);
    this.router.route('/verification-token').post(this.validator(this.dto.email), this.controller.verificationToken);
    this.router.route('/verify-email').post(this.validator(this.dto.token), this.controller.verifyEmail);

    this.router.route('/forgot-password').post(this.validator(this.dto.email), this.controller.forgotPassword);
    this.router
      .route('/password')
      .put(this.authorizeVendor(), this.validator(this.dto.password), this.controller.updatePassword);
    this.router
      .route('/reset-password')
      .post(this.validator(this.dto.resetPassword), this.controller.resetPassword);
    this.router.route('/refresh-token').get(this.controller.getRefreshToken);

    return this.router;
  }
}

export default AuthVendorRoute;
