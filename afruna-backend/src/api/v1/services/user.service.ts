import HttpError from '@helpers/HttpError';
import { AddressInterface, PersonalInfo, UserInterface } from '@interfaces/User.Interface';
import UserRepository from '@repositories/User.repository';
import Service from '@services/service';
import ProvideService from './provide.service';
import { ProvideInterface } from '@interfaces/Provide.Interface';
// import { logger } from '@utils/logger';
// import s3 from '@helpers/multer';
// import { OPTIONS } from '@config';

class UserService extends Service<UserInterface, UserRepository> {
  protected repository = new UserRepository();
  private static _instance: UserService;
  private _provideService = ProvideService.instance;

  async block(userId: string) {
    const user = await this.findOne(userId);
    if (!user) throw new HttpError('invalid user', 404);
    return this.update(userId, { blocked: !user.blocked });
  }

  async deActivate(userId: string) {
    const user = await this.findOne(userId);
    if (!user) throw new HttpError('invalid user', 404);
    return this.update(userId, { deActivated: true });
  }

  async reActivate(userId: string) {
    const user = await this.findOne(userId);
    if (!user) throw new HttpError('invalid user', 404);
    return this.update(userId, { deActivated: false });
  }

  addAddressToAddressbook(userId: string, data: AddressInterface) {}

  addAddress(userId: string, data: AddressInterface) {

    return this.update(userId, { load: { key: 'addresses', value: data } });
  }

  async updateProfile(userId: string, data: PersonalInfo) {
    return this.update(userId,data);
  }


  async getAddress(userId: string, addressId: string) {
    const user = await this.findOne(userId);
    if (!user) throw new HttpError('invalid user', 404);
    return user.addresses.find((val) => (<any>val)._id === addressId);
  }

  async getAllAddresses(userId: string) {
    const user = await this.findOne(userId);
    if (!user) throw new HttpError('invalid user', 404);
    return [...user.addresses];
  }

  getFollow(userId: string, followers = true, page = 1, limit = 10) {
    const followType = followers ? 'followers' : 'following';
    return new Promise((resolve, reject) => {
      let totalDocs = 0;
      let totalPages = 0;
      this.custom()
        .findById(userId)
        .then((user) => {
          if (!user) {
            reject(new HttpError('invalid user', 404));
          }
          totalDocs = (user![followType] as string[]).length;
          totalPages = Math.floor(totalDocs / limit) + 1;
          if (page > totalPages) reject(new HttpError('invalid page', 400));
          const query = (user![followType] as string[]).reverse().slice(page - 1, page + limit);
          return this.find({}, { in: { query: '_id', in: query } });
        })
        .then((users) => {
          const result = {
            totalDocs,
            totalPages,
            page,
            limit,
            data: users,
          };
          resolve(result);
        })
        .catch((error) => {
          throw error;
        });
    });
  }

  async toggleFollow(userId: string, followId: string) {
    const user = await this.findOne(userId);
    const followUser = await this.findOne(followId);
    if (!user || !followUser) throw new HttpError('invalid user', 404);

    const isFollowing = await this.custom().findOne({ _id: userId, following: { $in: [followId] } });

    if (isFollowing) {
      this.custom().findByIdAndUpdate(
        followId,
        {
          $pull: { followers: userId },
        },
        { new: true },
      );

      return await this.custom().findByIdAndUpdate(
        userId,
        {
          $pull: { following: followId },
        },
        { new: true },
      );
    } else {
      this.custom().findByIdAndUpdate(
        followId,
        {
          $addToSet: { followers: userId },
          // Set or update the id field
        },
        { new: true },
      );

      return await this.custom().findByIdAndUpdate(
        userId,
        {
          $addToSet: { following: followId },
        },
        { new: true },
      );
    }
  }

  async iAmFollowing(me: string, user: string | Partial<UserInterface>) {
    if (typeof user !== 'string') {
      return false;
    }
    return !!(await this.custom().findOne({ _id: me, following: { $in: [user] } }));
  }

  async isFollowingMe(me: string, user: string | Partial<UserInterface>) {
    if (typeof user !== 'string') {
      return false;
    }
    return !!(await this.custom().findOne({ _id: user, following: { $in: [me] } }));
  }
  async findOneUser(query: string | Partial<UserInterface>, me?: string) {
    const user = await this.repository.findOne(query);
    if (!user) throw new HttpError('invalid user', 404);
    if (me) {
      user.isFollower = await this.isFollowingMe(me, query);
      user.isFollowing = await this.iAmFollowing(me, query);
    }
    return user;
  }
  static instance() {
    if (!UserService._instance) {
      UserService._instance = new UserService();
    }
    return UserService._instance;
  }
  async getRatings(providerId: string) {
    const ratings = await this._provideService()
      .custom()
      .aggregate<unknown>([
        {
          $match: { providerId },
        },
        {
          $group: { _id: '$providerId', ratings: { $avg: '$ratings' }, ratedBy: { $sum: '$ratedBy' } },
        },
      ]);
    return ratings[0] as {
      _id: string;
      ratings: number;
      ratedBy: number;
    };
  }

  async totalSum(query: string | Partial<UserInterface>, me?: string) {
    const user = await this.repository.findOne(query);
    if (!user) throw new HttpError('invalid user', 404);
    if (me) {
      user.isFollower = await this.isFollowingMe(me, query);
      user.isFollowing = await this.iAmFollowing(me, query);
    }
    return user;
  }
}

export default UserService;
