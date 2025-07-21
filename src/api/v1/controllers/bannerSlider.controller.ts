import { Request } from 'express';
import BannerSliderService from '@services/bannerSlider.service';
import { BannerSliderInterface } from '@interfaces/BannerSlider.Interface';
import Controller from '@controllers/controller';

class BannerSliderController extends Controller<BannerSliderInterface> {
  service = new BannerSliderService();
  responseDTO = undefined;

  get = this.control(async (req: Request) => {
    const result = await this.service.find();
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  create = this.control(async (req: Request) => {
    const result = await this.service.create(req.body);
    if (!result) throw new this.HttpError(`${this.resource} not created`, 400);
    return result;
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