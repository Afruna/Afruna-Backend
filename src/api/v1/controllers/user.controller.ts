/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import UserService from '@services/user.service';
import { AddressInterface, PersonalInfo, UserInterface, UserRole } from '@interfaces/User.Interface';
import Controller from '@controllers/controller';
import { UserResponseDTO } from '@dtos/user.dto';

class UserController extends Controller<UserInterface> {
  service = new UserService();
  responseDTO = UserResponseDTO.User;
  getOne = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.findOneUser(params, req.params[this.resourceId] ? req.user?._id : null);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    if (result.role === UserRole.PROVIDER) {
      const { ratings, ratedBy } = await this.service.getRatings(result._id.toString());
      result.ratedBy = ratedBy;
      result.ratings = ratings;
    }
    return result;
  });

  update = this.control(async (req: Request) => {
    this.processFile(req);
    
    const params = req.params[this.resourceId] || req.user?._id!;
    const data = <UserInterface>req.body;
    console.log(data)
    const result = await this.service.update(params, data);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });


  updateAddressBook = this.control(async(req: Request)=>{
    this.processFile(req);
    const params = req.params[this.resourceId] || req.user?._id!;
    const data = <AddressInterface>req.body;
    const result = await this.service.addAddress(params, data);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  }, UserResponseDTO.User)

  updatePersonalInfo = this.control(async(req: Request)=>{
    this.processFile(req);
    const params = req.params[this.resourceId] || req.user?._id!;
    const data = <PersonalInfo>req.body;
    const result = await this.service.updateProfile(params, data);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  }, UserResponseDTO.User)

  delete = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.delete(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });


  deleteAccount = this.control(async (req: Request) => {
    const params = req.user?._id!;

    const result = await this.service.delete(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  toggleFollow = this.control(async (req: Request) => {
    const result = await this.service.toggleFollow(req.user?._id, req.body.userId);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  deActivate = this.control(async (req: Request) => {
    const result = await this.service.deActivate(req.user?._id);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  reActivate = this.control(async (req: Request) => {
    const result = await this.service.reActivate(req.user?._id);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getFollowers = this.control(async (req: Request) => {
    const result = await this.service.getFollow(
      req.user?._id,
      true,
      (req.query.page as unknown as number) || 1,
      (req.query.limit as unknown as number) || 10,
    );
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getFollowing = this.control(async (req: Request) => {
    const result = await this.service.getFollow(
      req.user?._id,
      false,
      (req.query.page as unknown as number) || 1,
      (req.query.limit as unknown as number) || 10,
    );
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

}

export default UserController;
