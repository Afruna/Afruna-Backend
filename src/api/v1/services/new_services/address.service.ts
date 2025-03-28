import HttpError from '@helpers/HttpError';
import UserService from './user.service';
import { AddressInterface } from '@interfaces/User.Interface';

class AddressService {
  private _userService = UserService.instance;
}

export default AddressService;
