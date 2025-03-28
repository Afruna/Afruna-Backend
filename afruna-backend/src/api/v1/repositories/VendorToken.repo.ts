import { TokenInterface } from '@interfaces/Token.Interface';
import { VendorTokenInterface } from '@interfaces/VendorToken.Interface';
import VendorToken from '@models/VendorToken';
import Repository from '@repositories/repository';

class VendorTokenRepository extends Repository<VendorTokenInterface> {
  protected model = VendorToken;
}

export default VendorTokenRepository;
