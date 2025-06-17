import { Request, Response } from 'express';
import Controller from '@controllers/controller';
import PayoutService from '@services/payout.service';
import { PayoutInterface, PayoutMethod, PayoutStatus } from '@interfaces/Payout.Interface';
import HttpError from '@helpers/HttpError';
import { logger } from '@utils/logger';

export default class PayoutController extends Controller<PayoutInterface> {
  public service = PayoutService.instance();
  public responseDTO = () => ({});

  requestPayout = this.control(async (req: Request) => {
    try {
      const { amount, method, bankDetails } = req.body;
      const vendorId = req.vendor?._id;

      if (!vendorId) throw new HttpError('Unauthorized', 401);
      if (!amount || amount <= 0) throw new HttpError('Invalid amount', 400);
      if (!method || !Object.values(PayoutMethod).includes(method)) {
        throw new HttpError('Invalid payout method', 400);
      }

      // If bank transfer, require bank details
      if (method === PayoutMethod.BANK_TRANSFER && !bankDetails) {
        throw new HttpError('Bank details required for bank transfer', 400);
      }

      

      const payout = await this.service.requestPayout(
        vendorId.toString(),
        amount,
        method,
        bankDetails
      );

      return payout;
    } catch (error) {
      console.log(error);
      throw new this.HttpError(error.message, 400);
    }
  });

  approvePayout = this.control(async (req: Request) => {
    try {
      const { payoutId } = req.params;
      const adminId = req.vendor?._id;

      if (!adminId) throw new HttpError('Unauthorized', 401);
      if (!payoutId) throw new HttpError('Payout ID is required', 400);

      const payout = await this.service.approvePayout(payoutId, adminId.toString());

      return payout;
    } catch (error) {
      logger.error('Error in approvePayout:', error);
      throw new this.HttpError(error.message, 400);
    }
  });

  rejectPayout = this.control(async (req: Request) => {
    try {
      const { payoutId } = req.params;
      const { reason } = req.body;
      const adminId = req.vendor?._id;

      if (!adminId) throw new HttpError('Unauthorized', 401);
      if (!payoutId) throw new HttpError('Payout ID is required', 400);
      if (!reason) throw new HttpError('Rejection reason is required', 400);

      const payout = await this.service.rejectPayout(payoutId, adminId.toString(), reason);

      return payout;
    } catch (error) {
      logger.error('Error in rejectPayout:', error);
      throw new this.HttpError(error.message, 400);
    }
  });

  getVendorPayouts = this.control(async (req: Request) => {
    try {
      const vendorId = req.vendor?._id;
      const { status } = req.query;

      if (!vendorId) throw new HttpError('Unauthorized', 401);

      const payouts = await this.service.getVendorPayouts(
        vendorId.toString(),
        status as PayoutStatus
      );

      return payouts;
    } catch (error) {
      logger.error('Error in getVendorPayouts:', error);
      throw new this.HttpError(error.message, 400);
    }
  });

  getPendingPayouts = this.control(async (req: Request) => {
    try {
      const payouts = await this.service.getPendingPayouts();

      return payouts;
    } catch (error) {
      logger.error('Error in getPendingPayouts:', error);
      throw new this.HttpError(error.message, 400);
    }
  });

  bulkPayout = this.control(async (req: Request) => {
    try {
      const { vendorIds, amount, method } = req.body;
      const adminId = req.vendor?._id;

      if (!adminId) throw new HttpError('Unauthorized', 401);
      if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
        throw new HttpError('Valid vendor IDs array is required', 400);
      }
      if (!amount || amount <= 0) throw new HttpError('Invalid amount', 400);
      if (!method || !Object.values(PayoutMethod).includes(method)) {
        throw new HttpError('Invalid payout method', 400);
      }

      const payouts = await this.service.bulkPayout(
        vendorIds,
        amount,
        method,
        adminId.toString()
      );

      return payouts;
    } catch (error) {
      logger.error('Error in bulkPayout:', error);
      throw new this.HttpError(error.message, 400);
    }
  });

  getPayoutDetails = this.control(async (req: Request) => {
    try {
      const { payoutId } = req.params;
      const payout = await this.service.findOne(payoutId);

      if (!payout) throw new HttpError('Payout not found', 404);

      return payout;
    } catch (error) {
      logger.error('Error in getPayoutDetails:', error);
      throw new this.HttpError(error.message, 400);
    }
  });
}
