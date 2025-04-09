import { body, check, param, query } from 'express-validator';
import { MESSAGES } from '@config';
import { UserResponseDTO } from './user.dto';
import { UserInterface } from '@interfaces/User.Interface';
import { IAdmin } from '@models/Admin';

export const authRequestDTO = {
  login: [
    check('email').isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL),
    check('password').isLength({ min: 8 }).withMessage(MESSAGES.SHORT_PASSWORD),
  ],
  password: [body('oldPassword').exists(), body('password').exists()],
  resetPassword: [body('password').exists()],
  email: [check('email').isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL)],
  token: [param('token').isString().withMessage(MESSAGES.INVALID_TOKEN)],
  authToken: [body('token').exists()],
  code: [query('code').exists()],
  google: [param('code').optional()],
  // password: [
  //   check('password').isLength({ min: 8 }).withMessage(MESSAGES.SHORT_PASSWORD),
  //   // check('confirmPassword').custom((value: string, { req }) => {
  //   //   if (value !== req.body.password) {
  //   //     // throw error if passwords do not match
  //   //     return false;
  //   //   }
  //   //   return value;
  //   // }),
  // ],
  register: [
    check('email').isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL),
    check('password').isLength({ min: 8 }).withMessage(MESSAGES.SHORT_PASSWORD),

    check('firstName').exists(),
    check('lastName').exists(),
    check('phoneNumber').exists(),
    check('country').exists(),
  ],
};

export class AuthResponseDTO {
  static login = (data: { token: string, refreshToken: string, user: DocType<UserInterface> }) => {
    const result = {
      user: UserResponseDTO.User(data.user),
      token: data.token,
      refreshToken: data.refreshToken
    };
    return result;
  };

  static adminLogin = (data: { token: string, admin: IAdmin }) => {
    const result = {
      token: data.token,
      admin: data.admin
    };
    return result;
  };



  static signUp = UserResponseDTO.User;
  static User = UserResponseDTO.User;
}
