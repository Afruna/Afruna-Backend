import { body, check, param, query } from 'express-validator';
import { MESSAGES } from '@config';
import { IVendorResponseDTO, VendorInterface } from '@interfaces/Vendor.Interface';

export const vendorRequestDTO = {
  id: [param('vendorId').exists()],
  vendorId: [body('vendorId').exists()],
  update: [
    check('email').not().exists(),
    check('password').not().exists(),
    check('role').not().exists(),
    check('verifiedEmail').not().exists(),
    check('verificationToken').not().exists(),
    check('resetToken').not().exists(),
    check('addresses').not().exists(),
    check('isVendor').not().exists(),
    check('socketId').not().exists(),
    check('fromOauth').not().exists(),
    check('online').not().exists(),
    check('lastName').optional().isString(),
    check('phoneNumber').optional().isString(),
    check('country').optional().isString(),
    check('avatar').optional(),
  ]
};

export class VendorResponseDTO {
  static Vendor = <T extends { data: Array<DocType<VendorInterface>>; totalDocs: number }>(
    data: DocType<VendorInterface>,
  ): IVendorResponseDTO => {
    const fn = (_: DocType<VendorInterface>) => {
      return {
        _id: _._id!,
        emailAddress: _.emailAddress!,
        firstname: _.firstname,
        lastname: _.lastname,
        phoneNumber: _.phoneNumber
      };
    };

    return {
      _id: data._id,
      emailAddress: data.emailAddress,
      shopName: data.shopName,
      firstname: data.firstname,
      lastname: data.lastname,
      phoneNumber: data.phoneNumber,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      vendorType: data.vendorType
    };
    // if ('totalDocs' in data) {
    //   (<any>data).data = data.data.map((_) => fn(_));
    //   return data;
    // } else {
    //   const result = Array.isArray(data) ? data.map((_) => fn(_)) : fn(data);
    //   return result;
    // }
  };
}
