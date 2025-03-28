import HttpError from '@helpers/HttpError';
import { TokenInterface } from '@interfaces/Token.Interface';
import TokenRepository from '@repositories/Token.repo';
import Service from '@services/service';
import UserService from './user.service';
import * as Config from '@config';

class TokenService extends Service<TokenInterface, TokenRepository> {
  protected repository = new TokenRepository();
  protected readonly _userService = UserService.instance;
  private static _instance: TokenService;

  static instance() {
    if (!TokenService._instance) {
      TokenService._instance = new TokenService();
    }
    return TokenService._instance;
  }

  async create(data: Partial<TokenInterface>) {
    return this.repository.create(data).then(async (token) => {
      const populatedToken = await this.findOne(token._id);
      if (!populatedToken) throw new HttpError('invalid token', 404);
      return populatedToken;
    });
  }

  find(
    query?:
      | Partial<
          DocType<TokenInterface> & {
            page?: string | number | undefined;
            limit?: string | number | undefined;
          }
        >
      | undefined,
    options?: OptionsParser<TokenInterface>,
  ): Promise<DocType<TokenInterface>[]> {
    return this.repository.find(query, {
      ...options,
      multiPopulate: [
        {
          path: 'user',
          model: 'User',
        },
      ],
    });
  }

  findOne(
    query: string | Partial<TokenInterface>,
    options?: Omit<OptionsParser<TokenInterface>, 'sort' | 'limit' | 'skip'> | undefined,
  ) {
    return this.repository.findOne(query, {
      ...options,
      multiPopulate: [
        {
          path: 'user',
          model: 'User',
        },
      ],
    });
  }

  async delete(id: string) {
    const tokenDoc = await this.repository.delete(id);
    if (!tokenDoc) throw new HttpError(Config.MESSAGES.INVALID_TOKEN, 404);
    return tokenDoc;
  }
}

export default TokenService;
