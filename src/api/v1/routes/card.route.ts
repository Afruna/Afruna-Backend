/* eslint-disable import/no-unresolved */
import CardController from '@controllers/card.controller';
import { cardRequestDTO } from '@dtos/card.dto';
import { CardInterface } from '@interfaces/Card.Interface';
import Route from '@routes/route';

class CardRoute extends Route<CardInterface> {
  controller = new CardController('card');
  dto = cardRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get(this.authorize(), this.controller.getByUserId)
      .post(
        this.authorize(),
        this.validator(this.dto.create),
        this.controller.create,
      );

    this.router
      .route('/:cardId')
      .put(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
      .patch(this.authorize(), this.validator(this.dto.update.concat(this.dto.id)), this.controller.setAsDefault)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default CardRoute;
