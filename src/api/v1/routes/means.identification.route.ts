/* eslint-disable import/no-unresolved */
import MeansIdentificationController from '@controllers/means.identification.controller';
import { meansIdentificationRequestDTO } from '@dtos/means.identification.dto';
import { MeansIdentificationInterface } from '@interfaces/Means.Identification.Interface';
import Route from '@routes/route';

class MeansIdentificationRoute extends Route<MeansIdentificationInterface> {
  controller = new MeansIdentificationController('meansIdentification');
  dto = meansIdentificationRequestDTO;
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
      .route('/:meansIdentificationId')
      .put( this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default MeansIdentificationRoute;
