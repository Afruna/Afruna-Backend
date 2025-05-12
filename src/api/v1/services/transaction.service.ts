/* eslint-disable no-underscore-dangle */
import Service from '@services/service';
import { PaymentMethod, TransactionEvent, TransactionInterface } from '@interfaces/Transaction.Interface';
import { logger } from '@utils/logger';
import paystack from '@helpers/paystack';
import UserService from '@services/user.service';
import Transaction from '@models/Transaction';
import OrderService from '@services/order.service';
import HttpError from '@helpers/HttpError';
import WalletService from '@services/wallet.service';
// import CardService from '@services/card.service';
import { Authorization, PaystackResponseDTO } from '@interfaces/Paystack.Interface';
import TransactionRepository from '@repositories/Transaction.repo';
import ProductService from './product.service';
import BookingService from './booking.service';
import { use } from 'passport';
import { verifyPaystack } from '@utils/paystack';
import { PAYSTACK_REDIRECT } from '@config';
import PaymentRepository from '@repositories/Payment.repo';
import { PAYMENT_STATUS } from '@interfaces/Payment.Interface';
import DepositRepository from '@repositories/Deposit.repo';
import { DEPOSIT_STATUS } from '@interfaces/Deposit.Interface';
import { OrderStatus } from '@interfaces/Order.Interface';
import CardService from './card.service';
import OrderSessionService from './order.session.service';
import OrderSessionRepository from '@repositories/OrderSession.repo';
import NotificationService from './notification.service';

class TransactionService extends Service<TransactionInterface, TransactionRepository> {
  protected repository = new TransactionRepository();
  private static _instance: TransactionService;

  private _paystack = paystack();
  private _userService = UserService.instance;
  private _orderService = OrderService.instance;
  private _orderSessionService = OrderSessionService.instance;
  private _walletService = WalletService.instance;
  protected _productService = ProductService.instance;
  protected _bookingService = BookingService.instance;
  protected _cardService = CardService.instance;
  protected paymentRepository = new PaymentRepository();
  protected depositRepository = new DepositRepository();
  protected orderSessionRepository = new OrderSessionRepository();
  protected _notificationService = NotificationService.instance;

  // private _cardService =  CardService();

  async initializePayment(orderSessionRef: string, orderId: string, userId: string, url: string | null = null) {
    const data = {
      orderSessionRef,
      orderId,
      userId,
      type: 'product',
    };

    

    const orderSession = await this._orderSessionService().findOne({ _id: orderSessionRef});
    if (!orderSession) throw new HttpError('order not found', 404);

    const amount = (orderSession.total + orderSession.deliveryFee + orderSession.vat);

    const payment = await this.paymentRepository.create({ userId, amount, referenceId: orderId })

    const user = await this._userService().findOne(orderSession.userId.toString());
    const result = await this._paystack.initialize(`${(orderSession.total + orderSession.vat + orderSession.deliveryFee)}`, user!, data, PAYSTACK_REDIRECT, payment._id);
    return result;
  }

  async initializeServicePayment(bookingId: string, userId: string, url: string | null = null) {
    const data = {
      bookingId,
      userId,
      type: 'service',
    };
    const booking = await this._bookingService().custom().findById(bookingId);
    if (!booking) throw new HttpError('order not found', 404);

    const user = await this._userService().findOne(booking.userId.toString());
    const result = await this._paystack.initialize(`${booking.amount}`, user!, data, url);
    return result;
  }


  async initializeWalletDeposit(depositId: string, amount: number, userId: string, url: string | null = null) {
    const data = {
      depositId,
      userId,
      type: 'wallet',
    };

    const payment = await this.paymentRepository.create({ userId, amount, referenceId: depositId })

    const user = await this._userService().findOne(userId.toString());
    const result = await this._paystack.initialize(`${amount}`, user!, data, url, payment._id);
    return result;
  }

  async webhookHandler(data: PaystackResponseDTO) {
    console.log("Webhook Data", data);
    try {
      if (data.event === 'charge.success') {
        const reference = data.data.reference;
        const referenceExists = !!(await this.findOne({ reference }));

        if (referenceExists) return;

        let payment = await this.paymentRepository.findOne({_id: reference})

        payment = await this.paymentRepository.update({_id: payment._id}, { status: PAYMENT_STATUS.SUCCESSFUL})

        const card = this._cardService().findOne({ userId: payment.userId, bin: data.data.authorization.bin, last4: data.data.authorization.last4 })

        if(!card)
        await this._cardService().create({
          userId: payment.userId,
          authorization_code: data.data.authorization.authorization_code,
          bin:  data.data.authorization.bin,
          last4: data.data.authorization.last4,
          exp_month: data.data.authorization.exp_month,
          exp_year: data.data.authorization.exp_year,
          channel: data.data.authorization.channel,
          card_type: data.data.authorization.card_type,
          bank: data.data.authorization.bank,
          country_code: data.data.authorization.country_code
        })

        const type = data.data.metadata.type;
        if (type === 'service') {

          const userId = payment.userId;
          const bookingId = <string>payment.referenceId;
          await this.create({
            success: true,
            userId,
            event: TransactionEvent.PAYMENT,
            amount: +data.data.amount / 100,
            date: new Date(),
            description: 'payment for ' + bookingId,
            reference,
          });

          const booking = await this._bookingService().findOne(bookingId);

          const providerId = booking?.vendorId;
          await this._bookingService().update(bookingId, { isPaid: true });
          const walletId =
            (await this._walletService().findOne({ userId: providerId })) ||
            (await this._walletService().create(<any>{ userId: providerId }));
          await this._walletService().update(walletId._id, {
            increment: { key: 'balance', value: +data.data.amount / 100 },
          });
          await this.create({
            success: true,
            event: TransactionEvent.CREDITED,
            userId: providerId!.toString(),
            amount: +booking!.amount,
            date: new Date(),
            description: 'payment for ' + booking,
            reference,
          });
        } 
        else if (type === 'product') {

          const userId = payment.userId;
          const orderId = payment.referenceId;

          await this.create({
            success: true,
            userId,
            event: TransactionEvent.PAYMENT,
            amount: +data.data.amount / 100,
            date: new Date(),
            description: 'payment for ' + orderId + ' ' + 'order-Id',
            reference,
          });

          for await (const order of await this._orderService().find({ _id: orderId })) {
            const vendorId = order.vendor;
            await this._orderService().update(order._id, { isPaid: true, orderStatus: OrderStatus.PAID });

            await this.orderSessionRepository.update({ _id: order.sessionId }, { orderStatus: OrderStatus.PAID })
            // const walletId =
            //   (await this._walletService().findOne({ userId: vendorId })) ||
            //   (await this._walletService().create(<any>{ userId: vendorId }));

            // await this._walletService().update(walletId._id, {
            //   increment: { key: 'balance', value: +data.data.amount / 100 },
            // });

            await this.create({
              success: true,
              event: TransactionEvent.CREDITED,
              userId: vendorId.toString(),
              amount: +order.total,
              date: new Date(),
              description: 'payment for ' + order.customId + ' ' + 'order',
              reference,
            });

            for await (const orderItem of order.items) {
              const product = await this._productService().findOne(<string>orderItem.productId);

              if (!product) return;

              const isOutOfStock = product.sold + orderItem.quantity >= product.quantity;
              const options = [...product.options];

              if (order.options && order.options.length > 0) {
                for (const opts of order.options) {
                  const productOptionIdx = options.findIndex((v) => v._id.toString() === opts._id.toString());
                  if (productOptionIdx !== -1) {
                    options[productOptionIdx].availableQuantity -= 1;
                  }
                }
              }

              await this._productService()
                .custom()
                .findByIdAndUpdate(<string>orderItem.productId, {
                  $inc: { frequency: 1, sold: orderItem.quantity },
                  isOutOfStock,
                  options,
                });
            }
          }

          
        }
        else if (type === 'wallet') {
          const user_Id = payment.userId;
          const depositId = payment.referenceId;

         const  deposit = await this.depositRepository.update({_id: depositId}, { status: DEPOSIT_STATUS.SUCCESSFUL});

          await this.create({
            success: true,
            userId: user_Id,
            event: TransactionEvent.PAYMENT,
            amount: +data.data.amount / 100,
            date: new Date(),
            description: 'fund wallet for User: ' + user_Id,
            reference,
          });

          await this._walletService().syncFunding(<string>user_Id, (data.data.amount / 100));
        }

        // if (userId) {
        //   const card = <Authorization>data.data.authorization;
        //   if (card.reusable) {
        //     await this._cardService.create({
        //       ...card,
        //       userId,
        //     });
        //   }
      } else if (data.event === 'transfer.success') {
        const vendorId = data.data.reason;
        await this.create({
          success: true,
          userId: vendorId,
          amount: +data.data.amount / 100,
          event: TransactionEvent.WITHDRAWAL,
          date: new Date(),
          description: 'withdrawal',
          reference: data.data.reference,
        });
        const walletId =
          (await this._walletService().findOne({ userId: vendorId })) ||
          (await this._walletService().create(<any>{ userId: vendorId }));
        await this._walletService().update(walletId._id, {
          increment: { key: 'balance', value: -data.data.amount / 100 },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async callbackHandler(reference: string) {
    
  }

  async verifyPayment(reference: string) {
    const response = await verifyPaystack(reference);

    // return { status: "success"}

    return response;
  }

  async walletHandler(userId: string, reference: string, amount: number, metadata: any = {}, paymentMethod: PaymentMethod = PaymentMethod.WALLET) {
    try 
    {

        const referenceExists = !!(await this.findOne({ reference }));

        const type = metadata.type;

        if (referenceExists) return;

        

        await this._walletService().debitWallet(userId, amount);

        const orderNumber = reference;
        

        if (type === 'service') {
          const bookingId = metadata.bookingId;
          await this.create({
            success: true,
            userId,
            event: TransactionEvent.PAYMENT,
            amount: +amount,
            date: new Date(),
            description: 'payment for ' + bookingId,
            reference,
            paymentMethod
          });

          const booking = await this._bookingService().findOne(bookingId);

          const providerId = booking?.providerId;
          await this._bookingService().update(bookingId, { isPaid: true });
          const walletId =
            (await this._walletService().findOne({ userId: providerId })) ||
            (await this._walletService().create(<any>{ userId: providerId }));
          await this._walletService().update(walletId._id, {
            increment: { key: 'balance', value: +amount },
          });
          await this.create({
            success: true,
            event: TransactionEvent.CREDITED,
            userId: providerId!.toString(),
            amount: +booking!.amount,
            date: new Date(),
            description: 'payment for ' + booking,
            reference,
            paymentMethod
          });
        } else if (type === 'product') {

          const orderSessionRef = metadata.orderSessionRef;

          await this.create({
            success: true,
            userId,
            event: TransactionEvent.PAYMENT,
            amount: +amount,
            date: new Date(),
            description: 'payment for ' + reference + ' ' + 'order-Id',
            reference,
            paymentMethod
          });

          for await (const order of await this._orderService().find({ _id: reference }, 
            {
              
            }
          )) {

            await this._orderSessionService().update({_id: order.sessionId }, { orderStatus: OrderStatus.PAID });

            await this._orderService().update(reference, { isPaid: true, orderStatus: OrderStatus.PAID });
            //send notifiqation to vendor
            await this._notificationService().create({
              vendorId: order.vendor,
              subject: 'New Paid Order',
              message: `A vendor just paid for an Order - ${order.customId}`,
              sent_at: new Date(),
              is_read: false,
            });

            // const walletId =
            //   (await this._walletService().findOne({ userId: vendorId })) ||
            //   (await this._walletService().create(<any>{ userId: vendorId }));

            // await this._walletService().update(walletId._id, {
            //   increment: { key: 'balance', value: +data.data.amount / 100 },
            // });

            
            

            for await (const orderItem of order.items) {
              const product = await this._productService().findOne(<string>orderItem.productId);

              if (!product) return;

              //TODO
              // await this.create({
              //   success: true,
              //   event: TransactionEvent.CREDITED,
              //   userId: <string>product.vendorId,
              //   amount: +orderItem.amount,
              //   date: new Date(),
              //   description: 'payment for ' + order.customId + ' ' + 'order',
              //   reference,
              //   paymentMethod
              // });

              const isOutOfStock = product.sold + orderItem.quantity >= product.quantity;
              const options = [...product.options];

              if (order.options && order.options.length > 0) {
                for (const opts of order.options) {
                  const productOptionIdx = options.findIndex((v) => v._id.toString() === opts._id.toString());
                  if (productOptionIdx !== -1) {
                    options[productOptionIdx].availableQuantity -= 1;
                  }
                }
              }

              await this._productService()
                .custom()
                .findByIdAndUpdate(<string>orderItem.productId, {
                  $inc: { frequency: 1, sold: orderItem.quantity },
                  // isOutOfStock,
                  options,
                });
            }
          }
        }

        return { message: "Payment Done", status: true}
     
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  getTxnByUser(userId: string) {
    return this.find({ userId });
  }

  async handleQuotePayment(
  userId: string, 
  quoteId: string, 
  amount: number, 
  reference: string,
  vendorId: string,
  paymentMethod: PaymentMethod = PaymentMethod.WALLET
) {
  try {
    // Check if transaction already exists
    const referenceExists = await this.findOne({ reference });
    if (referenceExists) return;

    // Create transaction record for customer payment
    await this.create({
      success: true,
      userId,
      event: TransactionEvent.PAYMENT,
      amount,
      date: new Date(),
      description: `Payment for quote ${quoteId}`,
      reference,
      paymentMethod
    });

    // Create transaction record for vendor credit
    await this.create({
      success: true,
      userId: vendorId,
      event: TransactionEvent.CREDITED,
      amount,
      date: new Date(),
      description: `Credit for quote ${quoteId}`,
      reference,
      paymentMethod
    });

    return { success: true, message: "Quote payment processed successfully" };

  } catch (error) {
    logger.error('Error processing quote payment:', error);
    throw new HttpError('Failed to process quote payment', 500);
  }
}

  static instance() {
    if (!TransactionService._instance) {
      TransactionService._instance = new TransactionService();
    }
    return TransactionService._instance;
  }
}

export default TransactionService;
