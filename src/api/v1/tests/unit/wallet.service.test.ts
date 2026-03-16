/**
 * @jest-environment node
 */
import WalletService from '../../services/wallet.service';
import HttpError from '../../helpers/HttpError';
import { TransactionEvent } from '../../interfaces/Transaction.Interface';

// Mock paystack module
jest.mock('../../helpers/paystack', () => {
  return jest.fn(() => ({
    verifyTransaction: jest.fn(),
    initializeTransaction: jest.fn(),
  }));
});

// Mock repository
jest.mock('../../repositories/Wallet.repo');

describe('WalletService - verifyFunding', () => {
  let walletService: WalletService;

  beforeEach(() => {
    jest.clearAllMocks();
    walletService = new WalletService();
  });

  describe('verifyFunding - Bug Fix: Extract userId from metadata', () => {
    it('should correctly extract userId from Paystack metadata (parsed from JSON string)', async () => {
      // This test documents the bug fix where wallet verification
      // was querying by user.email which doesn't exist in Wallet model.
      // Now it correctly extracts userId from Paystack metadata.
      
      const mockTransaction = {
        status: 'success',
        amount: 50000, // 500 NGN in kobo
        metadata: JSON.stringify({ userId: 'user456' }) // Paystack returns metadata as JSON string
      };

      const mockWallet = {
        _id: 'wallet123',
        userId: 'user456',
        balance: 1000,
      };

      const paystackMock = (walletService as any)._paystack;
      paystackMock.verifyTransaction.mockResolvedValue(mockTransaction);

      const walletRepoMock = (walletService as any).repository;
      walletRepoMock.findOne = jest.fn().mockResolvedValue(mockWallet);
      walletRepoMock.update = jest.fn().mockResolvedValue({ ...mockWallet, balance: 1500 });

      const result = await walletService.verifyFunding('ref123');

      // Verify the wallet was updated (not queried by email)
      expect(walletRepoMock.findOne).toHaveBeenCalledWith({ userId: 'user456' });
      expect(walletRepoMock.update).toHaveBeenCalledWith(
        'wallet123',
        expect.objectContaining({ balance: 1500 }) // 1000 + 500 = 1500
      );
    });

    it('should handle metadata as object (for backward compatibility)', async () => {
      const mockTransaction = {
        status: 'success',
        amount: 50000,
        metadata: { userId: 'user456' } // Object format
      };

      const mockWallet = {
        _id: 'wallet123',
        userId: 'user456',
        balance: 1000,
      };

      const paystackMock = (walletService as any)._paystack;
      paystackMock.verifyTransaction.mockResolvedValue(mockTransaction);

      const walletRepoMock = (walletService as any).repository;
      walletRepoMock.findOne = jest.fn().mockResolvedValue(mockWallet);
      walletRepoMock.update = jest.fn().mockResolvedValue({ ...mockWallet, balance: 1500 });

      await walletService.verifyFunding('ref123');

      expect(walletRepoMock.findOne).toHaveBeenCalledWith({ userId: 'user456' });
    });

    it('should throw error if transaction was not successful', async () => {
      const paystackMock = (walletService as any)._paystack;
      paystackMock.verifyTransaction.mockResolvedValue({
        status: 'failed',
        amount: 50000,
        metadata: JSON.stringify({ userId: 'user456' })
      });

      await expect(walletService.verifyFunding('ref123'))
        .rejects
        .toThrow('Transaction not successful');
    });

    it('should throw error if userId is missing from metadata', async () => {
      const paystackMock = (walletService as any)._paystack;
      paystackMock.verifyTransaction.mockResolvedValue({
        status: 'success',
        amount: 50000,
        metadata: JSON.stringify({})
      });

      await expect(walletService.verifyFunding('ref123'))
        .rejects
        .toThrow('User ID not found in transaction metadata');
    });

    it('should throw error if metadata is invalid JSON', async () => {
      const paystackMock = (walletService as any)._paystack;
      paystackMock.verifyTransaction.mockResolvedValue({
        status: 'success',
        amount: 50000,
        metadata: 'invalid json'
      });

      await expect(walletService.verifyFunding('ref123'))
        .rejects
        .toThrow('Invalid metadata format');
    });

    it('should correctly convert kobo to naira when funding wallet', async () => {
      const mockTransaction = {
        status: 'success',
        amount: 100000, // 1000 NGN in kobo
        metadata: JSON.stringify({ userId: 'user789' })
      };

      const mockWallet = {
        _id: 'wallet789',
        userId: 'user789',
        balance: 500,
      };

      const paystackMock = (walletService as any)._paystack;
      paystackMock.verifyTransaction.mockResolvedValue(mockTransaction);

      const walletRepoMock = (walletService as any).repository;
      walletRepoMock.findOne = jest.fn().mockResolvedValue(mockWallet);
      walletRepoMock.update = jest.fn().mockResolvedValue({ ...mockWallet, balance: 1500 });

      await walletService.verifyFunding('ref789');

      // 100000 kobo = 1000 NGN; 500 + 1000 = 1500
      expect(walletRepoMock.update).toHaveBeenCalledWith(
        'wallet789',
        expect.objectContaining({ balance: 1500 })
      );
    });

    it('should record transaction with WALLET_FUNDING event', async () => {
      const mockTransaction = {
        status: 'success',
        amount: 50000,
        metadata: JSON.stringify({ userId: 'user456' })
      };

      const mockWallet = {
        _id: 'wallet123',
        userId: 'user456',
        balance: 1000,
      };

      const paystackMock = (walletService as any)._paystack;
      paystackMock.verifyTransaction.mockResolvedValue(mockTransaction);

      const walletRepoMock = (walletService as any).repository;
      walletRepoMock.findOne = jest.fn().mockResolvedValue(mockWallet);
      walletRepoMock.update = jest.fn().mockResolvedValue({ ...mockWallet, balance: 1500 });

      const transactionServiceMock = (walletService as any).transactionService;
      transactionServiceMock.create = jest.fn().mockResolvedValue({});

      await walletService.verifyFunding('ref123');

      expect(transactionServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          event: TransactionEvent.WALLET_FUNDING
        })
      );
    });
  });

  describe('fundWallet', () => {
    it('should include userId in metadata for Paystack transaction', async () => {
      const userId = 'user123';
      const amount = 500;
      const email = 'user@example.com';

      (walletService as any)._userService = {
        findOne: jest.fn().mockResolvedValue({ _id: userId, email })
      };

      const paystackMock = (walletService as any)._paystack;
      paystackMock.initializeTransaction.mockResolvedValue({
        authorization_url: 'https://paystack.com/pay/abc123',
        reference: 'ref_abc123',
      });

      await walletService.fundWallet(userId, amount);

      // Verify metadata includes userId (critical for the verifyFunding fix)
      expect(paystackMock.initializeTransaction).toHaveBeenCalledWith(
        email,
        50000, // 500 * 100 = kobo
        expect.objectContaining({ userId })
      );
    });
  });
});
