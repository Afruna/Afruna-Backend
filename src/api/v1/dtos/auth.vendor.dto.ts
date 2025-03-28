import { body, check, param, query } from 'express-validator';
import { MESSAGES } from '@config';
import { UserResponseDTO } from './user.dto';
import { UserInterface } from '@interfaces/User.Interface';
import { VendorInterface } from '@interfaces/Vendor.Interface';
import { VendorResponseDTO } from './vendor.dto';

export const authVendorRequestDTO = {
  login: [
    check('email').isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL),
    check('password').isLength({ min: 8 }).withMessage(MESSAGES.SHORT_PASSWORD),
  ],
  password: [body('oldPassword').exists(), body('password').exists()],
  resetPassword: [
    check('password').isLength({ min: 8 }).withMessage(MESSAGES.MIN_PASSWORD_ERROR),
    check('token').isLength({ min: 6 }).withMessage(MESSAGES.INVALID_TOKEN),
  ],
  email: [check('email').isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL)],
  token: [
    check('email').isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL),
    check('token').isLength({ min: 6 }).withMessage(MESSAGES.INVALID_TOKEN),
  ],
  code: [query('code').exists()],
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
    check('emailAddress').isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL),
    check('password').isLength({ min: 8 }).withMessage(MESSAGES.SHORT_PASSWORD),

    check('firstname').exists(),
    check('lastname').exists(),
    check('phoneNumber').exists(),
    check('shopName').exists(),
  ],
};

export class AuthVendorResponseDTO {
  static login = (data: { token: string; vendor: DocType<VendorInterface> }) => {
    const result = {
      vendor: VendorResponseDTO.Vendor(data.vendor),
      token: data.token,
    };
    return result;
  };

  static signUp = VendorResponseDTO.Vendor;
  static Vendor = VendorResponseDTO.Vendor;
}
