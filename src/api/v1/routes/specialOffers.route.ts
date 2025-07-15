/* eslint-disable import/no-unresolved */
import SpecialOffersController from '@controllers/specialOffers.controller';
import { specialOffersRequestDTO } from '@dtos/specialOffers.dto';
import Route from '@routes/route';
import { SpecialOffersInterface } from '@models/SpecialOffers';
import { authorize, authorizeVendor } from '@middlewares/jwt';

class SpecialOffersRoute extends Route<SpecialOffersInterface> {
  controller = new SpecialOffersController('specialOffer');
  dto = specialOffersRequestDTO;

  initRoutes() {
    // Public routes (read-only)
    this.router.route('/')
      .get(this.controller.get);

    this.router.route('/active')
      .get(this.controller.getActive);

    // this.router.route('/stats')
    //   .get(this.controller.getStats);

    this.router.route('/grouped-by-tag')
      .get(this.controller.getGroupedByTag);

    this.router.route('/product/:productId')
      .get(this.validator(this.dto.query), this.controller.getByProduct);

    this.router.route('/tag/:tagId')
      .get(this.validator(this.dto.query), this.controller.getByTag);

    this.router.route('/by-tag/:tagId')
      .get(this.controller.getOffersByTag);

    this.router.route('/:id')
      .get(this.validator(this.dto.id), this.controller.getOne);

    // Admin routes (full CRUD)
    this.router.route('/')
      .post(
        // this.authorize(['admin']),
        this.validator(this.dto.create),
        this.controller.create
      );

    this.router.route('/:id')
      .put(
        // this.authorize(['admin']),
        this.validator(this.dto.id.concat(this.dto.update)),
        this.controller.update
      )
      .delete(
        // this.authorize(['admin']),
        this.validator(this.dto.id),
        this.controller.delete
      );

    this.router.route('/:id/toggle-status')
      .put(
        // this.authorize(['admin']),
        this.validator(this.dto.id),
        this.controller.toggleStatus
      );

    return this.router;
  }
}

export default SpecialOffersRoute; 