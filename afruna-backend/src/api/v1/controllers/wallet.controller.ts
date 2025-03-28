/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import WalletService from '@services/wallet.service';
import { WalletInterface } from '@interfaces/Wallet.Interface';
import Controller from '@controllers/controller';
// import { WalletResponseDTO } from '@dtos/Wallet.dto';

class WalletController extends Controller<WalletInterface> {
  service = new WalletService();
  responseDTO = undefined; // WalletResponseDTO.Wallet;

  getOne = this.control(async (req: Request) => {
    const result = await this.service.getOrCreateWallet(req.user?._id );
    return result;
  });

  getByVendor = this.control(async (req: Request) => {
    const result = await this.service.getOrCreateWalletByVendor(req.vendor?._id );
    return result;
  });

  getBank = this.control(async (req: Request) => {
    return this.service.getBanks();
  });

  addBank = this.control(async (req: Request) => {
    const result = await this.service.addBank(req.user?._id.toString(), req.body);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  removeBank = this.control(async (req: Request) => {
    const result = await this.service.removeBank(req.user?._id, req.params.accountId);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  resolveAccountNumber = this.control(async (req: Request) => {
    const result = await this.service.resolveAccountNumber(req.body.accountNumber, req.body.bankCode);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  withdraw = this.control(async (req: Request) => {
    const result = await this.service.withdraw(req.user?._id, req.body.accountId, +req.body.amount);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  fundWallet = this.control(async (req: Request) => {
    const result = await this.service.fundWallet(req.user?._id.toString(), req.body.amount);
    return result;
  });

  depositToWallet = this.control(async (req: Request) => {
    const result = await this.service.depositToWallet(req.user?._id.toString(), req.body.amount);
    return result;
  });

  verifyFunding = this.control(async (req: Request) => {
    const result = await this.service.verifyFunding(req.body.reference);
    return result;
  });
}

export default WalletController;
