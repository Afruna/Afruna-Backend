/* eslint-disable no-underscore-dangle */
import ServiceAdapter from '@helpers/serviceAdapter';
import { MESSAGES, OPTIONS, PAYSTACK_SECRET } from '@config';
import { Request } from 'express';
import {
  PaystackInitializeResponse,
  PaystackSubscriptionResponse,
  type Plan,
  BankInterface,
  AccountDetails,
  CreateRecipient,
  CreateRecipientResponse,
  TransferData,
  TransferResponse,
  VerifyTransactionResponse,
} from '@interfaces/Paystack.Interface';
import { logger } from '@utils/logger';
import { v4 as uuid4 } from 'uuid';

class Paystack {
  // eslint-disable-next-line no-use-before-define
  static _instance: Paystack;

  private usePaystack = OPTIONS.USE_PAYSTACK;
  private paystackService;

  private options = {
    headers: {
      authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
  };

  constructor() {
    this.paystackService = new ServiceAdapter('https://api.paystack.co').baseService;
  }

  initialize(amount: string, user: Request['user'], metaData?: object, url: string | null = null, reference: string | null = null) {
    if (!this.usePaystack) {
      logger.error(MESSAGES.PAYSTACK_NOT_INITIALIZED);
      return null;
    }
    // eslint-disable-next-line object-curly-newline
    const data = { email: user?.email, amount: +amount * 100, metadata: metaData };

    if (url) {
      Object.assign(data, { callback_url: url });
    }

    if (reference) {
      Object.assign(data, { reference: reference });
    }

    console.log("Meta Data", metaData)

    return <Promise<PaystackInitializeResponse>>(
      this.paystackService('post', '/transaction/initialize', data, this.options)
    );
  }

  subscribe(plan: Plan, user: Request['user']) {
    if (!this.usePaystack) {
      logger.error(MESSAGES.PAYSTACK_NOT_INITIALIZED);
      return null;
    }

    const data = {
      customer: (<any>user).subscription.paystackId, // "CUS_xxxxxxxxxx",
      // plan: this.plans[plan], // "PLN_xxxxxxxxxx",
      // start_date: date,
      metadata: {
        userId: user!._id,
        plan,
      },
    };

    return <Promise<PaystackSubscriptionResponse>>this.paystackService('post', '/subscription', data, this.options);
  }

  disableSubscription(plan: Plan, user: Request['user']) {
    if (!this.usePaystack) {
      logger.error(MESSAGES.PAYSTACK_NOT_INITIALIZED);
      return null;
    }

    const data = {
      code: (<any>user).subscription.subscriptionCode,
      token: (<any>user).subscription.emailToken,
    };

    return this.paystackService('post', '/subscription/disable', data, this.options);
  }

  getBanks() {
    if (!this.usePaystack) {
      logger.error(MESSAGES.PAYSTACK_NOT_INITIALIZED);
      return null;
    }

    return <Promise<BankInterface[]>>this.paystackService('get', '/bank?currency=NGN', this.options);
  }

  confirmAccount(accountNumber: string, bankCode: string) {
    if (!this.usePaystack) {
      logger.error(MESSAGES.PAYSTACK_NOT_INITIALIZED);
      return null;
    }

    return <Promise<AccountDetails>>(
      this.paystackService('get', `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, this.options)
    );
  }

  createRecipient(data: Omit<CreateRecipient, 'currency' | 'type'>) {
    if (!this.usePaystack) {
      logger.error(MESSAGES.PAYSTACK_NOT_INITIALIZED);
      return null;
    }

    (<CreateRecipient>data).currency = 'NGN';
    (<CreateRecipient>data).type = 'nuban';
    return <Promise<CreateRecipientResponse>>this.paystackService('post', '/transferrecipient', data, this.options);
  }

  // Verify the account number
  // Create a transfer recipient
  // Initiate a transfer
  // Listen for transfer status
  transfer(data: Omit<TransferData, 'source' | 'reference'>) {
    if (!this.usePaystack) {
      logger.error(MESSAGES.PAYSTACK_NOT_INITIALIZED);
      return null;
    }
    (<TransferData>data).reference = uuid4();
    (<TransferData>data).source = 'balance';
    return <Promise<TransferResponse>>this.paystackService('post', '/transfer', <TransferData>data, this.options);
  }

  verifyTransaction(reference: string) {
    if (!this.usePaystack) {
      logger.error(MESSAGES.PAYSTACK_NOT_INITIALIZED);
      return null;
    }
    return <Promise<VerifyTransactionResponse>>(
      this.paystackService('get', `/transaction/verify/${reference}`, this.options)
    );
  }

  refund(reference: string) {
    if (!this.usePaystack) {
      logger.error(MESSAGES.PAYSTACK_NOT_INITIALIZED);
      return null;
    }
    return <Promise<unknown>>this.paystackService('post', `/refund`, { transaction: reference }, this.options);
  }

  static instance() {
    if (Paystack._instance) {
      return Paystack._instance;
    }
    Paystack._instance = new Paystack();
    return Paystack._instance;
  }
}

export default Paystack.instance;
