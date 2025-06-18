import Service from '@services/service';
import { PayoutInterface, PayoutMethod, PayoutStatus, PayoutType } from '@interfaces/Payout.Interface';
import PayoutRepository from '@repositories/Payout.repo';
import HttpError from '@helpers/HttpError';
import WalletService from './wallet.service';
import { logger } from '@utils/logger';
import { TransactionEvent, PaymentMethod } from '@interfaces/Transaction.Interface';
import Transaction from '@models/Transaction';

class PayoutService extends Service<PayoutInterface, PayoutRepository> {
  protected repository = new PayoutRepository();
  private static _instance: PayoutService;
  private _walletService = new WalletService();

  async requestPayout(vendorId: string, amount: number, method: PayoutMethod, bankDetails?: any) {
    // Check if vendor has sufficient balance
    const wallet = await this._walletService.findOne({ vendorId });
    if (!wallet || wallet.balance < amount) {
      throw new HttpError('Insufficient wallet balance', 400);
    }

    // Create payout request
    const payout = await this.create({
      vendorId,
      amount,
      status: PayoutStatus.PENDING,
      type: PayoutType.SINGLE,
      method,
      bankDetails,
      reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    // Create pending transaction record
    // await Transaction.create({
    //   userId: vendorId,
    //   amount: amount,
    //   event: TransactionEvent.WITHDRAWAL,
    //   description: `Payout request of ${amount}`,
    //   reference: payout.reference,
    //   success: false,
    //   date: new Date()
    // });

    return payout;
  }

  async approvePayout(payoutId: string, adminId: string) {
    const payout = await this.findOne(payoutId);
    if (!payout) throw new HttpError('Payout request not found', 404);
    if (payout.status !== PayoutStatus.PENDING) {
      throw new HttpError('Payout request is not pending', 400);
    }

    // Update payout status
    const updatedPayout = await this.update(payoutId, {
      status: PayoutStatus.APPROVED,
      approvedBy: adminId,
      approvedAt: new Date()
    });

    // Process the payout
    try {
      // Deduct from vendor's wallet
      await this._walletService.debitWallet(null, payout.amount, payout.vendorId.toString());

      // Update transaction record to success
      await Transaction.findOneAndUpdate(
        { reference: payout.reference },
        {
          success: true,
          description: `Payout of ${payout.amount} approved and processed`,
          date: new Date()
        }
      );

      // Update payout status to completed
      await this.update(payoutId, {
        status: PayoutStatus.COMPLETED,
        completedAt: new Date()
      });

      return updatedPayout;
    } catch (error) {
      // If payout processing fails, update status and reason
      await this.update(payoutId, {
        status: PayoutStatus.FAILED,
        failureReason: error.message
      });

      // Update transaction record to failed
      await Transaction.findOneAndUpdate(
        { reference: payout.reference },
        {
          success: false,
          description: `Payout failed: ${error.message}`,
          date: new Date()
        }
      );

      throw error;
    }
  }

  async rejectPayout(payoutId: string, adminId: string, reason: string) {
    const payout = await this.findOne(payoutId);
    if (!payout) throw new HttpError('Payout request not found', 404);
    if (payout.status !== PayoutStatus.PENDING) {
      throw new HttpError('Payout request is not pending', 400);
    }

    // Update transaction record to failed
    await Transaction.findOneAndUpdate(
      { reference: payout.reference },
      {
        success: false,
        description: `Payout rejected: ${reason}`,
        date: new Date()
      }
    );

    return this.update(payoutId, {
      status: PayoutStatus.REJECTED,
      approvedBy: adminId,
      approvedAt: new Date(),
      failureReason: reason
    });
  }

  async getVendorPayouts(vendorId: string, status?: PayoutStatus) {
    const query: any = { vendorId };
    if (status) query.status = status;
    return this.find(query);
  }

  async getPendingPayouts() {
    return this.find({ status: PayoutStatus.PENDING });
  }

  async bulkPayout(vendorIds: string[], amount: number, method: PayoutMethod, adminId: string) {
    const payouts = [];
    for (const vendorId of vendorIds) {
      try {
        // Create payout record
        const payout = await this.create({
          vendorId,
          amount,
          status: PayoutStatus.PENDING,
          type: PayoutType.BULK,
          method,
          reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });

        // Create pending transaction record
        await Transaction.create({
          userId: vendorId,
          amount: amount,
          event: TransactionEvent.WITHDRAWAL,
          description: `Bulk payout request of ${amount}`,
          reference: payout.reference,
          success: false,
          date: new Date()
        });

        // Approve the payout immediately since it's initiated by admin
        await this.approvePayout(payout._id, adminId);
        payouts.push(payout);
      } catch (error) {
        logger.error(`Failed to process bulk payout for vendor ${vendorId}: ${error.message}`);
        // Continue with other vendors even if one fails
      }
    }
    return payouts;
  }

  static instance() {
    if (!PayoutService._instance) {
      PayoutService._instance = new PayoutService();
    }
    return PayoutService._instance;
  }
}

export default PayoutService; 