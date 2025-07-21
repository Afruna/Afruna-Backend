import { BannerSliderInterface } from '@interfaces/BannerSlider.Interface';
import BannerSliderRepository from '@repositories/BannerSlider.repo';
import Service from '@services/service';

class BannerSliderService extends Service<BannerSliderInterface, BannerSliderRepository> {
  protected repository = new BannerSliderRepository();
  private static _instance: BannerSliderService;

  static instance() {
    if (!this._instance) {
      this._instance = new BannerSliderService();
    }
    return this._instance;
  }
}

export default BannerSliderService; 