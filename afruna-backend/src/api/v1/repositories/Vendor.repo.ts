import { VendorInterface } from '@interfaces/Vendor.Interface';
import Vendor from '@models/Vendor';
import Repository from '@repositories/repository';

export default class VendorRepository extends Repository<VendorInterface> {
  protected model = Vendor;
}