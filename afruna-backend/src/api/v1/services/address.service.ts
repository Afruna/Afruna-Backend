
import { AddressInterface } from '@interfaces/Address.Interface';
import AddressRepository from '@repositories/Address.repo';
import Service from '@services/service';

class AddressService extends Service<AddressInterface, AddressRepository> {
  private static _instance: AddressService;
  protected repository = new AddressRepository();

  async getAddressByUserId(userId: string) {
    return this.find({ userId });
  }

  async setAsDefault(userId: string, addressId: string) {

    await this.update(
      { userId: userId },
      {
        load: { key: 'isDefault', value: false }
      })

    return await this.update(
      { _id: addressId },
      {
        load: { key: 'isDefault', value: true }
      })
  }

  async remove(addressId: string) {
    return this.delete({ _id: addressId });
  }

  static instance() {
    if (!AddressService._instance) {
      AddressService._instance = new AddressService();
    }
    return AddressService._instance;
  }
}

export default AddressService;
