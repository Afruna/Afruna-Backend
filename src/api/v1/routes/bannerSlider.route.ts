import Route from '@routes/route';
import BannerSliderController from '@controllers/bannerSlider.controller';
import { BannerSliderInterface } from '@interfaces/BannerSlider.Interface';

class BannerSliderRoute extends Route<BannerSliderInterface> {
  controller = new BannerSliderController('bannerSlider');
  dto = undefined;
  initRoutes() {
    this.router
      .route('/')
      .get(this.controller.get)
      .post(this.controller.create);

    this.router
      .route('/:id')
      .put(this.controller.update)
      .delete(this.controller.delete);

    return this.router;
  }
}

export default BannerSliderRoute;