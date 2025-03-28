/* eslint-disable import/no-unresolved */
import UserController from '@controllers/user.controller';
import { userRequestDTO } from '@dtos/user.dto';
import Route from '@routes/route';
import { UserInterface } from '@interfaces/User.Interface';

export default class UserRoute extends Route<UserInterface> {
  controller = new UserController('user');
  dto = userRequestDTO;
  initRoutes() {
    this.router.get('/', this.controller.get);
    this.router
      .route('/me')
      .get(this.controller.getOne)
      .put(
        this.fileProcessor.uploadOne<UserInterface>('avatar'),
        this.validator(this.dto.update),
        this.controller.update,
      )
      .patch(
        this.authorize(),
        this.controller.deActivate,
      )
      .delete(this.authorize(), this.controller.deleteAccount);
    this.router.route('/update-profile').patch(this.controller.updatePersonalInfo);
    this.router.route('/update-address').patch(this.controller.updateAddressBook);

    this.router.route('/following').get(this.controller.getFollowing);
    this.router.route('/follow').put(this.validator(this.dto.userId), this.controller.toggleFollow);
    this.router.route('/de-activate').put(this.authorize(), this.validator(this.dto.userId), this.controller.deActivate);
    this.router.route('/re-activate').put(this.validator(this.dto.userId), this.controller.reActivate);
    this.router
      .route('/:userId')
      .get(this.validator(this.dto.id), this.controller.getOne)
      .put(
        this.fileProcessor.uploadOne<UserInterface>('avatar'),
        this.validator(this.dto.update.concat(this.dto.id)),
        this.controller.update,
      )
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    return this.router;
  }
}
