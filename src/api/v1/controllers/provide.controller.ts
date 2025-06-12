/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import ProvideService from '@services/provide.service';
import { ProvideInterface } from '@interfaces/Provide.Interface';
import Controller from '@controllers/controller';
import { UserRole } from '@interfaces/User.Interface';
// import { ProvideResponseDTO } from '@dtos/Provide.dto';

class ProvideController extends Controller<ProvideInterface> {
  service = new ProvideService();
  responseDTO = undefined; // ProvideResponseDTO.Provide;

  create = this.control((req: Request) => {
    // this.processFile(req, true);
    const data = req.body;
    return this.service.create({ ...data, vendorId: req.vendor?._id.toString() });
  });

  searchByName = this.control(async (req: Request) => {
    const query = <string>req.query.name

    return this.service.findByName(query);
  });

  getSimilarServices = this.control(async (req: Request) => {
    const serviceId = <string>req.params.serviceId

    return this.service.getSimilarServices(serviceId);
  });

  getTop = this.control(async (req: Request) => {
    // TODO:
    const result = await this.service.paginatedFind({}, { vendorId: -1 }, [
      {
        path: 'categoryId',
        model: 'ServiceCategory',
      },

      {
        path: 'vendorId',
        model: 'Vendor',
        select: 'firstname lastname',
      },
    ]);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getPopular = this.control(async (req: Request) => {
    // TODO:
    const result = await this.service.paginatedFind({}, { vendorId: -1 }, [
      {
        path: 'categoryId',
        model: 'ServiceCategory',
      },

      {
        path: 'vendorId',
        model: 'Vendor',
        select: 'firstname lastname',
      },
    ]);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  getWithProviderId = this.control(async (req: Request) => {
    return this.service.find({ vendorId: req.vendor._id });
  });

  getByProviderId = this.control(async (req: Request) => {
    return this.service.find({ vendorId: req.params.providerId });
  });

  getAll = this.control((req: Request) => {
    const query: {
      [x: string]: string | boolean;
    } = this.safeQuery(req);

    if (req.vendor) {
      // const role = req.user.role;
      // if (role === UserRole.USER) {
      //   query.publish = true;
      //   query.verified = true;
      //   query.blocked = false;
      // } else if (role === UserRole.PROVIDER) {
        query.vendorId = req.vendor._id.toString();
      // }
    }

    // if (query.search) {
    //   Object.assign(query, this.parseSearchKey(<string>query.search, ['name']));
    //   delete query.search;
    // }
    // return this.service.paginatedFind(query, {}, [
      
    // ]);

    return this.service.find({}, { populate: {
      path: 'vendorId',
        model: 'Vendor',
        select: 'firstname lastname',
    }})
  });

  verify = this.control(async (req: Request) => {
    return this.service.verifyService(req.params.serviceId);
  });

  publish = this.control(async (req: Request) => {
    return this.service.togglePublish(req.params.serviceId);
  });

  providerCard = this.control(async (req: Request) => {
    return this.service.providerCard(req.params.providerId);
  });

  customerCard = this.control(async (req: Request) => {
    return this.service.customerCard(req.params.customerId);
  });

  getWithCategoryId = this.control(async (req: Request) => {
    const q = { ...this.safeQuery(req), category: req.params.categoryId };
    return this.service.paginatedFind(q);
  });
}
export default ProvideController;
