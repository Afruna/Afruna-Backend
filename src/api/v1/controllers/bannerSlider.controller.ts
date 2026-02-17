import { Request } from 'express';
import BannerSliderService from '@services/bannerSlider.service';
import { BannerSliderInterface, BannerSliderType } from '@interfaces/BannerSlider.Interface';
import Controller from '@controllers/controller';

class BannerSliderController extends Controller<BannerSliderInterface> {
  service = new BannerSliderService();
  responseDTO = undefined;

  get = this.control(async (req: Request) => {
    return this.service.find();
  });

  create = this.control(async (req: Request) => {
    const result = await this.service.create(req.body);
    if (!result) throw new this.HttpError(`${this.resource} not created`, 400);
    return result;
  });

  getByType = this.control(async (req: Request) => {
    const type = req.params.type as BannerSliderType;
    return this.service.find({ type });
  });

  // v2 - grouped by type
  getV2 = this.control(async (_req: Request) => {
    const [grid, carousel] = await Promise.all([
      this.service.find({ type: BannerSliderType.BANNER }),
      this.service.find({ type: BannerSliderType.CAROUSEL }),
    ]);
    return { grid, carousel };
  });

  update = this.control(async (req: Request) => {
    const result = await this.service.update(req.params.id, req.body);
    if (!result) throw new this.HttpError(`${this.resource} not updated`, 400);
    return result;
  });

  delete = this.control(async (req: Request) => {
    const result = await this.service.delete(req.params.id);
    if (!result) throw new this.HttpError(`${this.resource} not deleted`, 400);
    return result;
  });
}

export default BannerSliderController; 