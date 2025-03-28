/* eslint-disable import/no-unresolved */

import StoreFrontController from '@controllers/store.front.controller';
import { storeFrontRequestDTO } from '@dtos/store.front.dto';
import { StoreFrontInterface } from '@interfaces/Store.Front.Interface';
import Route from '@routes/route';

class StoreFrontRoute extends Route<StoreFrontInterface> {
  controller = new StoreFrontController('storeFront');
  dto = storeFrontRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get(this.authorizeVendor(), this.controller.getByVendorId)
      .post(
        this.authorizeVendor(),
        this.validator(this.dto.create),
        this.controller.create,
      );

    this.router
      .route('/:storeFrontId')
      .put(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default StoreFrontRoute;
