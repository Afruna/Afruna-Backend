import { Types } from 'mongoose';
import { AddressInterface } from './Address.Interface';

export interface OrderItemInterface {
  productId: string | Types.ObjectId;
  quantity: number;
  amount: number;
  tax?: number,
  deliveryFee?: number
}

export interface OrderInterface {
  _id?: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  vendor: string | Types.ObjectId;
  vendorId: string | Types.ObjectId;
  items: OrderItemInterface[];
  isPaid: boolean;
  total: number;
  sessionId: string | Types.ObjectId;
  addressId: string | Types.ObjectId;
  deliveryStatus: DeliveryStatus;
  orderStatus: OrderStatus;
  customId?: string;
  isCanceled: boolean;
  options: any[];
  orderNumber?: string;
  paymentMethod?: PaymentMethod;
  deliveryFee?: number;
  vat?: number;
  discount: number;
  request_token?: string;
  courier_id?: string;
  service_code?: string;
  sb_order_id?: string;
  tracking_url?: string;
}

export enum DeliveryStatus {
  DELIVERED = 'Delivered',
  PENDING = 'Pending',
  CANCELED = 'Canceled',
  SHIPPED = 'Shipped',
  RETURNED = 'Returned',
}

export enum OrderStatus {
  PENDING = 'Pending',
  PAID = 'PAID',
  CANCELLED = 'Cancelled',
  RETURNED = 'Returned',
  IN_PROGRESS = 'In Progress',
  SHIPPED = 'Shipped',
  FULFILLED = 'Fulfilled',
}


export enum PaymentMethod {
  CARD = 'CARD',
  WALLET = 'WALLET',
  ON_DELIVERY = 'ON_DELIVERY'
}

export interface OrderSessionInterface {
  _id?: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  total: number;
  orders: OrderInterface[];
  addressId: string | Types.ObjectId;
  txn_reference: string;
  customId?: string;
  orderNumber?: string;
  deliveryFee?: number;
  vat?: number;
  paymentMethod?: PaymentMethod;
  orderStatus?: OrderStatus;
  deliveryStatus: DeliveryStatus;

}
