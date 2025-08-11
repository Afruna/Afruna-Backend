import { BannerSliderInterface, BannerSliderType } from '@interfaces/BannerSlider.Interface';
import BannerSliderRepository from '@repositories/BannerSlider.repo';
import Service from '@services/service';
import HttpError from '@helpers/HttpError';

class BannerSliderService extends Service<BannerSliderInterface, BannerSliderRepository> {
  protected repository = new BannerSliderRepository();
  private static _instance: BannerSliderService;

  async create(data: Partial<BannerSliderInterface>) {
    if (data.type === BannerSliderType.BANNER) {
      const existingBannerTypeCount = await this.repository.count({ type: BannerSliderType.BANNER });
      if (existingBannerTypeCount >= 4) {
        throw new HttpError('Maximum of 4 grid banners allowed', 400);
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