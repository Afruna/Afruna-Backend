import { body, check, param, query } from 'express-validator';
import { MESSAGES } from '@config';
import { IUserResponseDTO, UserInterface } from '@interfaces/User.Interface';

export const userRequestDTO = {
  id: [param('userId').exists()],

  time: [query('time').exists()],
  userId: [body('userId').exists()],
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
    // check('password').isLength({ min: 8 }).withMessage(MESSAGES.SHORT_PASSWORD),
    // check('confirmPassword').custom((value: string, { req }) => {
    //   if (value !== req.body.password) {
    //     // throw error if passwords do not match
    //     throw new Error(MESSAGES.PASSWORD_MATCH_ERROR);
    //   } else {
    //     return value;
    //   }
    // }),
  ],
};

export class UserResponseDTO {
  static User = <T extends { data: Array<DocType<UserInterface>>; totalDocs: number }>(
    data: DocType<UserInterface> | Array<DocType<UserInterface>> | T,
  ): IUserResponseDTO | Array<IUserResponseDTO> | T => {
    

    const fn = (_: DocType<UserInterface>): IUserResponseDTO => {
      return {
        _id: _._id!.toString(), // Convert _id to string
        email: _.email!,
        firstName: _.firstName!,
        lastName: _.lastName!,
        role: _.role!,
        avatar: _.avatar,
        country: _.country!,
        online: _.online!,
        phoneNumber: _.phoneNumber!,
        followers: _.followers?.length || 0,
        following: _.following?.length || 0,
        createdAt: _.createdAt!,
        updatedAt: _.updatedAt!,
      };
    };
    
    // Check if the data is a paginated result
    if ('totalDocs' in data) {
      (<any>data).data = data.data.map((_) => fn(_));
      return data;
    } else {
      // Transform either a single object or an array of objects
      const result = Array.isArray(data) ? data.map((_) => fn(_)) : fn(data);
      return result;
    }
  };
}
