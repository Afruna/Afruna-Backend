import { BannerSliderInterface } from '@interfaces/BannerSlider.Interface';
import BannerSlider from '@models/BannerSlider';
import Repository from '@repositories/repository';

class BannerSliderRepository extends Repository<BannerSliderInterface> {
  protected model = BannerSlider;
}

export default BannerSliderRepository; 