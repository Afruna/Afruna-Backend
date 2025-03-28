/* eslint-disable import/no-unresolved */
import AuthController from '@controllers/auth.controller';
import { authRequestDTO } from '@dtos/auth.dto';
import Route from '@routes/route';
import { GOOGLE_API_REDIRECT, APPLE_API_REDIRECT, FACEBOOK_API_REDIRECT } from '@config';
import { AuthSessionInterface } from '@interfaces/AuthSession.Interface';
import passport from 'passport';
import { passportConfig } from 'src/config/passport.config';
import { getSignedToken } from '@utils/generateToken';

class AuthRoute extends Route<AuthSessionInterface> {
  controller = new AuthController('authSession');
  dto = authRequestDTO;

  initRoutes() {
    this.router.post('/signin', this.validator(this.dto.login), this.controller.login);
    this.router.route('/signup').post(this.validator(this.dto.register), this.controller.registration);
    this.router.route('/signup/seller').post(this.validator(this.dto.register), this.controller.sellerRegistration);
    this.router.route('/signup/provider').post(this.validator(this.dto.register), this.controller.providerRegistration);
    this.router.route('/verification-token').post(this.validator(this.dto.email), this.controller.verificationToken);
    this.router.route('/verify-email').post(this.validator(this.dto.authToken), this.controller.verifyEmail);

    this.router.route('/forgot-password').post(this.validator(this.dto.email), this.controller.forgotPassword);
    this.router
      .route('/password')
      .put(this.authorize(), this.validator(this.dto.password), this.controller.updatePassword);
    this.router
      .route('/reset-password/:token')
      .post(this.validator(this.dto.resetPassword), this.controller.resetPassword);

    this.router
      .route('/validate-token')
      .post(this.validator(this.dto.authToken), this.controller.validateToken);

    this.router.route('/o-auth-urls').get(this.controller.oAuthUrls);
    // this.router.route(`/${<string>APPLE_API_REDIRECT}`).post(this.validator(this.dto.code), this.controller.appleLogin);
    // this.router
    //
    //   .route(`/${<string>FACEBOOK_API_REDIRECT}`)
    //   .post(this.validator(this.dto.code), this.controller.facebookLogin);
    this.router.route(`/google`).get(this.validator(this.dto.code), this.controller.googleLogin);
    this.router.route('/refresh-token').get(this.controller.getRefreshToken);

    this.router.route('/social/google').get(passportConfig.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));
    this.router.route('/social/logout').get(this.controller.socialLogout);
    this.router
      .route('/google/callback')
      .get(passportConfig.authenticate('google', { failureRedirect: 'https://www.afruna.com/auth/error', failureMessage: true }), this.controller.newGoogleLogin);

    return this.router;
  }
}

export default AuthRoute;
