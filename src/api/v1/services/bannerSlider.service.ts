import { BannerSliderInterface, BannerSliderType, BannerSliderStatus } from '@interfaces/BannerSlider.Interface';
import BannerSliderRepository from '@repositories/BannerSlider.repo';
import Service from '@services/service';
import HttpError from '@helpers/HttpError';

class BannerSliderService extends Service<BannerSliderInterface, BannerSliderRepository> {
  protected repository = new BannerSliderRepository();
  private static _instance: BannerSliderService;

  async create(data: Partial<BannerSliderInterface>) {
    if (data.type === BannerSliderType.BANNER) {
      const existingBannerTypeCount = await this.repository.count({ 
        type: BannerSliderType.BANNER,
        status: BannerSliderStatus.ACTIVE 
      });
      if (existingBannerTypeCount >= 4) {
        throw new HttpError('Maximum of 4 active grid banners allowed. Please deactivate or delete an existing banner first.', 400);
      };
    };
    return this.repository.create(data);
  }

  static instance() {
    if (!this._instance) {
      this._instance = new BannerSliderService();
    }
    return this._instance;
  }
}

export default BannerSliderService; 