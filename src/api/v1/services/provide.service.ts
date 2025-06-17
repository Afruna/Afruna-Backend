import HttpError from '@helpers/HttpError';
import { ProvideInterface, ServiceStatusEnum } from '@interfaces/Provide.Interface';
import ProvideRepository from '@repositories/Provide.repo';
import Service from '@services/service';
import TransactionService from './transaction.service';
import { TransactionEvent } from '@interfaces/Transaction.Interface';
import UserService from '@services/user.service';
import ServiceCategoryRepository from '@repositories/ServiceCategory.repo';
import { ServiceStatusEnum } from '@enums/Service.enum';

class ProvideService extends Service<ProvideInterface, ProvideRepository> {
  protected repository = new ProvideRepository();
  protected serviceRepo = new ServiceCategoryRepository();
  protected readonly _txnService = TransactionService.instance;
  protected readonly _userService = UserService.instance;
  private static _instance: ProvideService;
  
  verifyService(serviceId: string) {
    return this.update(serviceId, { verified: true });
  }

  findByName(query: string) {
    const customQuery = '.*' + query + '.*';
    return this.repository.custom().find({ name: { $regex: customQuery, $options: "i" } }).populate({
      path: 'categoryId'
    });
  }


  async getSimilarServices(serviceId) {
    const service = await this.findOne({ _id: serviceId, status: ServiceStatusEnum.ACTIVE})

    if(!service)
      throw new HttpError("Invalid Service")

    const categoryId = service.categoryId;

    return await this.repository.find({ categoryId, status: ServiceStatusEnum.ACTIVE }, { multiPopulate: 
      [
        {
          path: 'vendorId',
          model: 'Vendor',
          select: 'firstname lastname'
        },
        {
          path: 'categoryId',
          model: 'ServiceCategory',
        }
      ]
     });
  }
  //  serviceCards(){

  //  }
  togglePublish(serviceId: string) {
    return new Promise<DocType<ProvideInterface>>((resolve, reject) => {
      this.findOne(serviceId)
        .then((service) => {
          if (!service) reject(new HttpError('invalid service', 404));
          return this.update(serviceId, { publish: !service?.publish });
        })
        .then((service) => {
          resolve(service!);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static instance() {
    if (!ProvideService._instance) {
      ProvideService._instance = new ProvideService();
    }
    return ProvideService._instance;
  }

  find(
    query?:
      | Partial<
          DocType<ProvideInterface> & {
            page?: string | number | undefined;
            limit?: string | number | undefined;
          }
        >
      | undefined,
    options?: OptionsParser<ProvideInterface>,
  ): Promise<DocType<ProvideInterface>[]> {
    return this.repository.find({...query, status: ServiceStatusEnum.ACTIVE}, {
      ...options,
      multiPopulate: [
        {
          path: 'vendorId',
          model: 'Vendor',
          select: 'firstname lastname'
        },
        {
          path: 'categoryId',
          model: 'ServiceCategory',
        }
      ],
    });
  }

  async providerCard(providerId: string) {
    const [totalServices, totalSales, totalWithdrawal, provider] = await Promise.all([
      this.count({ providerId }),
      this._txnService().find({ userId: providerId, event: TransactionEvent.CREDITED }),
      this._txnService().find({ userId: providerId, event: TransactionEvent.WITHDRAWAL }),
      this._userService().findOne(providerId),
    ]);

    return {
      totalSales: totalSales.reduce((total, val) => {
        return total + val.amount;
      }, 0),
      totalWithdrawal: totalWithdrawal.reduce((total, val) => {
        return total + val.amount;
      }, 0),
      totalServices,
      booked: provider?.booked,
    };
  }

  async customerCard(customId: string) {
    const [totalSpent] = await Promise.all([
      this._txnService().find({ customId: customId, event: TransactionEvent.CREDITED }),
    ]);

    return {
      totalSpent: totalSpent.reduce((total, val) => {
        return total + val.amount;
      }, 0),
    };
  }
}

export default ProvideService;
