import { AddressInterface } from '@interfaces/Address.Interface';
import { Schema, model } from 'mongoose';

const AddressSchema = new Schema<AddressInterface>(
  {
    address: String,
    streetNumber: String,
    name: String,
    phoneNumber: String,
    postCode: String,
    city: String,
    state: String,
    country: String,
    isDefault: { type: Boolean, default: false },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true },
);

const Address = model('Address', AddressSchema);

export default Address;
