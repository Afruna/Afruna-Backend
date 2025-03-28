import { StoreFrontInterface } from '@interfaces/Store.Front.Interface';
import StoreFrontRepository from '@repositories/StoreFront.repo';
import Service from '@services/service';

class StoreFrontService extends Service<StoreFrontInterface, StoreFrontRepository> {
  private static _instance: StoreFrontService;
  protected repository = new StoreFrontRepository();

  async getByVendorId(vendorId: string) {
    return this.findOne({ vendorId });
  }

  static instance() {
    if (!StoreFrontService._instance) {
      StoreFrontService._instance = new StoreFrontService();
    }
    return StoreFrontService._instance;
  }
}

export default StoreFrontService;
