import { DeliveryStatus, OrderInterface, OrderItemInterface, OrderStatus, PaymentMethod } from '@interfaces/Order.Interface';
import { Schema, model } from 'mongoose';
import { customIdPlugin } from './IdPlugin';
import { Query } from 'mongoose';

const OrderItemSchema = new Schema<OrderItemInterface>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: Number,
    amount: Number,
    tax: { type: Number, default: 0.00},
    deliveryFee: { type: Number, default: 0.00},
  },
  { _id: false },
);

const OrderSchema = new Schema<OrderInterface>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    addressId: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
    },
    items: [OrderItemSchema],
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'OrderSession',
    },
    isPaid: { type: Boolean, default: false },
    total: Number,
    deliveryFee: { type: Number, default: 0.00 },
    vat: { type: Number, default: 0.00 },
    discount: { type: Number, default: 0.00 },
    orderNumber: String,
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
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), default: PaymentMethod.WALLET },
    customId: String,
    isCanceled: { type: Boolean, default: false },
    options: Schema.Types.Mixed,
    request_token: { type: String, default: null },
    courier_id: { type: String, default: null },
    service_code: { type: String, default: null },
    sb_order_id: { type: String, default: null },
    tracking_url: { type: String, default: null },
  },
  { timestamps: true },
);

OrderSchema.pre(/^find/, function (this: Query<any, any>, next) {
  this.sort({ createdAt: -1 });
  next();
});

OrderSchema.plugin(customIdPlugin, { modelName: 'Order' });

const Order = model('Order', OrderSchema);

export default Order;
