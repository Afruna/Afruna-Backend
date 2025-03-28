import { MESSAGES } from '@config';
import { body, param } from 'express-validator';

export const walletRequestDTO = {
  id: [param('walletId').exists()],

  addBank: [
    body('accountName').exists(),
    body('accountNumber').exists(),
    body('bankName').exists(),
    body('bankCode').exists(),
  ],

  confirmAccount: [body('accountNumber').exists(), body('bankCode').exists()],

  removeBank: [param('accountId').exists()],

  withdraw: [body('accountId').exists(), body('amount').exists()],

  fundWallet: [body('amount').exists().isNumeric()],

  verifyFunding: [body('reference').exists()],
};
