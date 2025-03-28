/* eslint-disable no-underscore-dangle */
import { WalletInterface } from '@interfaces/Wallet.Interface';
import Wallet from '@models/Wallet';
import Service from '@services/service';
// import CardService from '@services/card.service';
import paystack from '@helpers/paystack';
import UserService from '@services/user.service';
import HttpError from '@helpers/HttpError';
import OrderService from '@services/order.service';
import WalletRepository from '@repositories/Wallet.repo';
import { PAYSTACK_REDIRECT } from '@config';
import DepositRepository from '@repositories/Deposit.repo';
import { generateDepositNumber } from '@utils/generateToken';
import TransactionService from './transaction.service';

class WalletService extends Service<WalletInterface, WalletRepository> {
  protected repository = new WalletRepository();
  protected depositRepo = new DepositRepository();
  private static _instance: WalletService;
  private transactionService = new TransactionService();

  // private _cardService = new CardService();
  private _paystack = paystack();
  private _userService = UserService.instance;
  private _orderService = OrderService.instance;

  // getCards(userId: string) {
  //   return this._cardService.find({ userId });
  // }

  async createWallet(data: WalletInterface) {
    return await this.create(data);
  }

  async getOrCreateWallet(userId: string) {
    let wallet = await this.findOne({ userId });
    if (!wallet) 
      wallet = await this.create({ userId });

    return wallet;
  }

  async getOrCreateWalletByVendor(vendorId: string) {
    let wallet = await this.findOne({ vendorId });
    if (!wallet) 
      wallet = await this.create({ vendorId });

    return wallet;
  }

  async getBanks() {
    return this._paystack.getBanks();
  }

  resolveAccountNumber(accountNumber: string, bankCode: string) {
    return this._paystack.confirmAccount(accountNumber, bankCode);
  }

  async debitWallet(userId: string, amount: number) {
    const wallet = await this.getOrCreateWallet(userId);
    
    if (wallet.balance < amount) throw new HttpError('insufficient balance', 400);
    let balance: number;
    
    balance = wallet.balance - amount;

    await this.custom().findByIdAndUpdate(
      { _id: wallet._id },
      {
        balance
      },
    );

    return true;
  }

  async withdraw(userId: string, bankAccountId: string, amount: number) {
    const wallet = await this.findOne({ userId });
    if (!wallet) throw new HttpError('invalid wallet', 404);
    const account = wallet.accounts.find((acc) => bankAccountId === acc._id.toString());
    if (!account) {
      throw new Error('invalid bank Account Id');
    }

    if (wallet.balance < amount) throw new HttpError('insufficient balance', 400);
    let recipient: string;
    if (account.recipientCode) {
      recipient = account.recipientCode;
    } else {
      recipient = (await this._paystack.createRecipient({
        name: account.accountName,
        account_number: account.accountNumber.toString(),
        bank_code: account.bankCode,
      }))!.recipient_code;
    }
    const result = await this._paystack.transfer({
      amount: amount.toString(),
      recipient,
      reason: wallet.userId.toString(),
    });
    await this.custom().findByIdAndUpdate(
      { 'accounts._id': account._id },
      {
        $set: { 'accounts.$.recipientCode': recipient },
      },
    );
    return result;
  }

  async addBank(userId: string, data: WalletInterface['accounts']) {
    const wallet = (await this.findOne({ userId })) || (await this.create({ userId }));
    if (!wallet) throw new HttpError('invalid user', 400);
    const bankExists = wallet.accounts.find((val) => val.accountNumber === (<any>data).accountNumber);
    if (bankExists) throw new HttpError('account already exists', 400);
    return this.update(wallet._id, { load: { key: 'accounts', value: data } });
  }

  async removeBank(userId: string, accountId: string) {
    const wallet = await this.findOne({ userId });
    if (!wallet) throw new HttpError('invalid user', 404);
    return this.update(wallet._id, { unload: { key: 'accounts', value: accountId } });
  }

  //#region fund wallet
  async fundWallet(userId: string, amount: number) {
    let wallet = await this.getOrCreateWallet(userId)

    const userService = UserService.instance();

    // @ts-ignore
    const user = await userService.findOne(wallet.userId);
    if (!user || !user.email) {
      throw new HttpError('User or email not found', 404);
    }

    const transaction = await this._paystack.initialize(amount.toString(), user, {
      reference: `wallet_funding_${userId}_${Date.now()}`,
    }, PAYSTACK_REDIRECT, <string>user._id);

    return transaction;
  }

  //#region deposit to wallet
  async depositToWallet(userId: string, amount: number) {
    let wallet = await this.getOrCreateWallet(userId)

    const userService = UserService.instance();

    // @ts-ignore
    const user = await userService.findOne(wallet.userId);
    if (!user || !user.email) {
      throw new HttpError('User or email not found', 404);
    }

    const transactionReference = generateDepositNumber();

    const deposit = await this.depositRepo.create({ userId: user._id, amount, transactionReference})

    const transaction = await this.transactionService.initializeWalletDeposit(deposit._id, amount, userId, PAYSTACK_REDIRECT);

    return transaction;
  }

  async verifyFunding(reference: string) {
    const response = await this._paystack.verifyTransaction(reference);
    //@ts-ignore
    if (response.status !== 'success') {
      throw new HttpError('Transaction not successful', 400);
    }

    //@ts-ignore
    const { amount, customer } = response;
    const email = customer.email;
    //@ts-ignore
    const wallet = await this.findOne({ 'user.email': email });
    if (!wallet) {
      throw new HttpError('Wallet not found', 404);
    }
    wallet.balance += amount / 100;
    await this.update(wallet._id, { balance: wallet.balance });

    return wallet;
  }

  async syncFunding(userId: string, amount: number) {

    //@ts-ignore
    const wallet = await this.getOrCreateWallet(userId);
    if (!wallet) {
      throw new HttpError('Wallet not found', 404);
    }
    wallet.balance += amount;
    await this.update(wallet._id, { balance: wallet.balance });

    return wallet;
  }

  static instance() {
    if (!WalletService._instance) {
      WalletService._instance = new WalletService();
    }
    return WalletService._instance;
  }
}
export default WalletService;
