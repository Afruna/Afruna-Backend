import { ShippingInfoInterface } from '@interfaces/Shipping.Info.Interface';
import ShippingInfo from '@models/ShippingInfo';
import Repository from '@repositories/repository';

class ShippingInfoRepository extends Repository<ShippingInfoInterface> {
  protected model = ShippingInfo;
}

export default ShippingInfoRepository;
