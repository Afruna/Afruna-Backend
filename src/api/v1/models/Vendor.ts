import { VendorInterface, VendorStatus, VendorType, KYCStatus } from '@interfaces/Vendor.Interface';
import mongoose, { Schema, model } from 'mongoose';

const VendorSchema = new Schema<VendorInterface>(
  {
    firstname: String,
    lastname: String,
    phoneNumber: String,
    emailAddress: String,
    kycStatus: { type: String, enum: Object.values(KYCStatus), default: KYCStatus.PENDING },
    shopName: String,
    password: String,
    blocked: { type: Boolean, default: false },
    verifiedEmail: { type: Boolean, default: false },
    followers: { type: Schema.Types.Mixed, default: [] },
    following: { type: Schema.Types.Mixed, default: [] },
    isFollowing: { type: Schema.Types.Mixed, default: null },
    isFollower: { type: Schema.Types.Mixed, default: null },
    visits: Number,
    ratings: Number,
    ratedBy: Number,
    vendorType: { type: String, enum: Object.values(VendorType), default: VendorType.MARKET_SELLER },
    businessAddress: { type: Schema.Types.ObjectId, ref: 'BusinessAddress' },
    returnAddress: { type: Schema.Types.ObjectId, ref: 'ReturnAddress' },
    businessDetail: { type: Schema.Types.ObjectId, ref: 'BusinessDetail' },
    paymentInfo: { type: Schema.Types.ObjectId, ref: 'PaymentInfo' },
    customerCareDetail: { type: Schema.Types.ObjectId, ref: 'CustomerCareDetail' },
    legalRep: { type: Schema.Types.ObjectId, ref: 'LegalRep' },
    meansOfIdentification: { type: Schema.Types.ObjectId, ref: 'MeansIdentification' },
    additionalInfo: { type: Schema.Types.ObjectId, ref: 'AdditionalInfo' },
    storeFront: { type: Schema.Types.ObjectId, ref: 'StoreFront' },
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.PENDING },
  },
  { timestamps: true },
);

VendorSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.sort({ createdAt: -1 });
  next();
});

const Vendor = model('Vendor', VendorSchema);

export default Vendor;
