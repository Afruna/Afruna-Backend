import { body } from 'express-validator';
import { PayoutMethod } from '@interfaces/Payout.Interface';

export const payoutRequestDTO = {
  request: [
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('method')
      .isIn(Object.values(PayoutMethod))
      .withMessage('Invalid payout method'),
    body('bankDetails')
      .if(body('method').equals(PayoutMethod.BANK_TRANSFER))
      .isObject()
      .withMessage('Bank details are required for bank transfer')
      .custom((value) => {
        if (!value.accountNumber || !value.accountName || !value.bankName) {
          throw new Error('Bank details must include accountNumber, accountName, and bankName');
        }
        return true;
      })
  ],

  bulk: [
    body('vendorIds')
      .isArray({ min: 1 })
      .withMessage('At least one vendor ID is required'),
    body('vendorIds.*')
      .isMongoId()
      .withMessage('Invalid vendor ID format'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('method')
      .isIn(Object.values(PayoutMethod))
      .withMessage('Invalid payout method')
  ],

  reject: [
    body('reason')
      .isString()
      .notEmpty()
      .withMessage('Rejection reason is required')
  ]
}; 