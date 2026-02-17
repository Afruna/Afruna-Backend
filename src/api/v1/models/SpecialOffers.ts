import { Schema, model, Types } from 'mongoose';

export interface SpecialOffersInterface {
    product?: Types.ObjectId | string;
    discount?: number;
    tag?: Types.ObjectId | string;
    discountId?: string;
    vendorId?: Types.ObjectId | string;
    status?: boolean;
    adminApproved?: boolean;
    adminApprovedAt?: Date;
    rejectionReason?: string;
}

const SpecialOffersSchema = new Schema({
    product: {type: Schema.Types.ObjectId, ref: 'Product'},
    discount: {type: Number, required: true},
    tag:  {type: Schema.Types.ObjectId, ref: 'Tags'},
    discountId: {type: String},
    vendorId: {type: Schema.Types.ObjectId, ref: 'Vendor'},
    status: {type: Boolean, default: true},
    adminApproved: {type: Boolean, default: false},
    adminApprovedAt: {type: Date},
    rejectionReason: {type: String},
}, {timestamps: true});



SpecialOffersSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next();
  }
  
  // Generate a random 8 character string for the discountId
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let discountId = '';
  for (let i = 0; i < 8; i++) {
    discountId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  this.set('discountId', discountId);
  next();
});


const SpecialOffers = model<SpecialOffersInterface>('SpecialOffers', SpecialOffersSchema);

export default SpecialOffers;