import { WalletInterface, BankAccountInterface } from '@interfaces/Wallet.Interface';
import { model, Schema, Model } from 'mongoose';

const bankAccountSchema = new Schema<BankAccountInterface>(
  {
    accountName: String,
    accountNumber: String,
    bankName: String,
    bankCode: String,
    recipientCode: String,
  },
  {
    timestamps: true,
  },
);
const walletSchema = new Schema<WalletInterface>(
  {
    balance: { type: Number, default: 0 },
    ledgerBalance: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    accounts: [bankAccountSchema],
  },
  {
    timestamps: true,
  },
);

export default <Model<WalletInterface>>model('Wallet', walletSchema);
