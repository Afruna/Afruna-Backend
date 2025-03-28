import { AuthVendorSessionInterface } from '@interfaces/AuthVendorSession.Interface';
import AuthVendorSession from '@models/AuthVendorSession';
import Repository from '@repositories/repository';

class AuthVendorSessionRepository extends Repository<AuthVendorSessionInterface> {
  protected model = AuthVendorSession;
}

export default AuthVendorSessionRepository;
