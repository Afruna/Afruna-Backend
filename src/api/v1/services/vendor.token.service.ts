import HttpError from '@helpers/HttpError';;
import Service from '@services/service';
import * as Config from '@config';
import { VendorTokenInterface } from '@interfaces/VendorToken.Interface';
import VendorTokenRepository from '@repositories/VendorToken.repo';
import VendorService from './vendor.service';

class VendorTokenService extends Service<VendorTokenInterface, VendorTokenRepository> {
  protected repository = new VendorTokenRepository();
  protected readonly _vendorService = VendorService;
  private static _instance: VendorTokenService;

  static instance() {
    if (!VendorTokenService._instance) {
      VendorTokenService._instance = new VendorTokenService();
    }
    return VendorTokenService._instance;
  }

  async create(data: Partial<VendorTokenInterface>) {
    return this.repository.create(data).then(async (token) => {
      const populatedToken = await this.findOne(token._id);
      if (!populatedToken) throw new HttpError('invalid token', 404);
      return populatedToken;
    });
  }

  find(
    query?:
      | Partial<
          DocType<VendorTokenInterface> & {
            page?: string | number | undefined;
            limit?: string | number | undefined;
          }
        >
      | undefined,
    options?: OptionsParser<VendorTokenInterface>,
  ): Promise<DocType<VendorTokenInterface>[]> {
    return this.repository.find(query, {
      ...options,
      multiPopulate: [
        {
          path: 'vendor',
          model: 'Vendor',
        },
      ],
    });
  }

  findOne(
    query: string | Partial<VendorTokenInterface>,
    options?: Omit<OptionsParser<VendorTokenInterface>, 'sort' | 'limit' | 'skip'> | undefined,
  ) {
    return this.repository.findOne(query, {
      ...options,
      multiPopulate: [
        {
          path: 'vendor',
          model: 'Vendor',
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

export default VendorTokenService;
