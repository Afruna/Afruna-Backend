import { ProvideInterface, ServiceStatusEnum } from '@interfaces/Provide.Interface';
import { Schema, model } from 'mongoose';
import { customIdPlugin } from './IdPlugin';

const ProvideSchema = new Schema<ProvideInterface>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    name: String,
    categoryId:  { type: Schema.Types.ObjectId},
    state: String,
    country: String,
    desc: String,
    price: Number,
    additionalService: [{ service: String, price: Number }],
    providerId: String,
    verified: Boolean,
    availability: {
      days: [String],
      hours: {
        from: Number,
        to: Number,
      },
    },
    photos: [String],
    tags: [String],
    licenseAndCertification: [String],
    insuranceCoverage: [String],
    publish: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    negotiable: { type: Boolean, default: false },
    ratings: { type: Number, default: 0 },
    ratedBy: { type: Number, default: 0 },
    booked: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(ServiceStatusEnum), default: ServiceStatusEnum.PENDING },
    rejectionReason: String,
  },
  { timestamps: true },
);

const Provide = model('Service', ProvideSchema);

export default Provide;
