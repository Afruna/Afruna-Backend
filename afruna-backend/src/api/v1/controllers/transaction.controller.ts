/* eslint-disable no-underscore-dangle */
import { Request, Response } from 'express';
import TransactionService from '@services/transaction.service';
import { TransactionInterface } from '@interfaces/Transaction.Interface';
import Controller from '@controllers/controller';
import { UserRole } from '@interfaces/User.Interface';
import dayjs from 'dayjs';
import paystack from '@helpers/paystack';
import { ORDER_REDIRECT, WALLET_REDIRECT } from '@config';
import { listBanks } from '@utils/paystack';
import OrderService from '@services/order.service';
import PaymentRepository from '@repositories/Payment.repo';
// import { TransactionResponseDTO } from '@dtos/Transaction.dto';

class TransactionController extends Controller<TransactionInterface> {
  service = new TransactionService();
  responseDTO = undefined; // TransactionResponseDTO.Transaction;
  private _paystack = paystack();
  serviceOrder = new OrderService();
  paymentRepository = new PaymentRepository();


  get = this.control((req: Request) => {
    let q = this.safeQuery(req);

    if (req.user?.role !== UserRole.ADMIN) {
      q = Object.assign(q, { userId: req.user?._id });
    }

    if (q['min-date'] || q['max-date']) {
      if (q['$and']) {
        q['$and'] = [
          ...q['$and'],
          ...this.parseRangeKeys(
            dayjs(<string>q['min-date'] || '1972-01-01').toDate(),
            dayjs(<string>q['max-date'] || '4072-01-01').toDate(),
            ['date'],
          )['$and'],
        ];
      } else {
        Object.assign(
          q,
          this.parseRangeKeys(
            dayjs(<string>q['min-date'] || '1972-01-01').toDate(),
            dayjs(<string>q['max-date'] || '4072-01-01').toDate(),
            ['date'],
          ),
        );
      }

      delete q['min-date'];
      delete q['max-date'];
    }

    return this.service.paginatedFind(q);
  });

  webhook = this.control(async (req: Request) => {
    await this.service.webhookHandler(req.body);
  });

  // callbackHandler = this.control(async (req: Request) => {
  //   return [];
  // });
  
  callbackHandler = async(req: Request, res: Response) => {

   // return [];
    // Successful authentication, redirect home.
    try
    {
      console.log("Trans Ref", req)
      const response = await this.service.verifyPayment(req.query.reference.toString());

      const payment = await this.paymentRepository.findOne({_id: response.reference})

      switch(response.metadata.type)
      {
         case "product":
          const orderSession = await this.serviceOrder.session.findOne({_id: <string>payment.referenceId}, {
            populate: {
              path: 'orders',
              model: 'Order',
            },
          })
        res.status(301).redirect(`${ORDER_REDIRECT}?orderId=${orderSession.orders[0]._id}&orderSessionRef=${payment.referenceId}`)
         break;

         case "wallet":
          res.redirect(`${WALLET_REDIRECT}?userId=${response.metadata.userId}`)
         break;
      }

      // if (response.status !== 'success') {
      //   res.redirect(`https://www.freexitnow.com`); //failure
      // }
      // else
      // {
      //   res.redirect(`https://www.afruna.com`); //Pass
      // }
    }
    catch(err)
    {
      console.log(err.message)
      res.redirect(`https://www.afruna.com`); //failure
    }
    
   
    

    
  }

  init = this.control(async (req: Request) => {
    const result = await this.service.initializePayment(req.body.orderId, req.user?._id, <string>req.query.url || null);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  initService = this.control(async (req: Request) => {
    const result = await this.service.initializeServicePayment(
      req.body.bookingId,
      req.user?._id,
      <string>req.query.url || null,
    );
    if (!result) throw new this.HttpError(`booking not found`, 404);
    return result;
  });
}

export default TransactionController;
