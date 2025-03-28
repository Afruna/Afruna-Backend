
import { CardInterface } from '@interfaces/Card.Interface';
import CardRepository from '@repositories/Card.repo';
import Service from '@services/service';

class CardService extends Service<CardInterface, CardRepository> {
  private static _instance: CardService;
  protected repository = new CardRepository();

  async getCardByUserId(userId: string) {
    return this.find({ userId });
  }

  async setAsDefault(cardId: string, userId: string) {

    await this.update(
      { userId: userId },
      {
        load: { key: 'isDefault', value: false }
      })

    return await this.update(
      { _id: cardId },
      {
        load: { key: 'isDefault', value: true }
      })
  }

  async remove(cardId: string) {
    return this.delete({ _id: cardId });
  }

  static instance() {
    if (!CardService._instance) {
      CardService._instance = new CardService();
    }
    return CardService._instance;
  }
}

export default CardService;
