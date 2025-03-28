import { DeliveryStatus, OrderSessionInterface, OrderStatus } from '@interfaces/Order.Interface';
import { Schema, model } from 'mongoose';
import { customIdPlugin } from './IdPlugin';

const OrderSessionSchema = new Schema<OrderSessionInterface>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    addressId: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
    },
    orders: [{
      type: Schema.Types.ObjectId,
      ref: 'Order',
    }],
    total: Number,
    deliveryFee: { type: Number, default: 0.00 },
    vat: { type: Number, default: 0.00 },
    deliveryStatus: {
      type: String,
      enum: [DeliveryStatus.CANCELED, DeliveryStatus.DELIVERED, DeliveryStatus.PENDING, DeliveryStatus.SHIPPED],
      default: DeliveryStatus.PENDING,
    },
    orderStatus: {
      type: String,
      enum: [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.CANCELLED],
      default: OrderStatus.PENDING,
    },
    txn_reference: String,
    customId: String,
    orderNumber: String,
  },
  { timestamps: true },
);
OrderSessionSchema.plugin(customIdPlugin, { modelName: 'OrderSession' });

const OrderSession = model('OrderSession', OrderSessionSchema);

export default OrderSession;
