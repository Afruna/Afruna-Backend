import { TokenInterface } from '@interfaces/Token.Interface';
import Token from '@models/Token';
import Repository from '@repositories/repository';

class TokenRepository extends Repository<TokenInterface> {
  protected model = Token;
}

export default TokenRepository;
