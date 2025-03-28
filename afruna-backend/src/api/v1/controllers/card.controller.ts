/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import Controller from '@controllers/controller';
import CardService from '@services/card.service';
import { CardInterface } from '@interfaces/Card.Interface';

class CardController extends Controller<CardInterface> {
  service = new CardService();
  responseDTO = undefined; // ProductResponseDTO.Product;

  getByUserId = this.control((req: Request) => {
    return this.service.getCardByUserId(req.user?._id.toString());
  });


  setAsDefault = this.control((req: Request) => {
    return this.service.setAsDefault(req.user?._id.toString(), req.params.cardId);
  });

  removeCard = this.control((req: Request) => {
    return this.service.remove(req.params.cardId);
  });
  
}

export default CardController;
