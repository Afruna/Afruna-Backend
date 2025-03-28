/* eslint-disable import/no-unresolved */
import LegalRepController from '@controllers/legal.rep.controller';
import { legalRepRequestDTO } from '@dtos/legal.rep.dto';
import { LegalRepInterface } from '@interfaces/Legal.Rep.Interface';
import Route from '@routes/route';

class LegalRepRoute extends Route<LegalRepInterface> {
  controller = new LegalRepController('legalRep');
  dto = legalRepRequestDTO;
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
      .route('/:legalRepId')
      .put(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default LegalRepRoute;
