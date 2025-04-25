import { VendorType } from "@interfaces/Vendor.Interface";
import Transaction from "@models/Transaction";
import Vendor from "@models/Vendor";

export const countVendorsByType = async (type: VendorType, date: Date) =>
  Vendor.countDocuments({ vendorType: type, createdAt: { $lte: date } });

export const sumTransactions = async (date: Date) => {
  const result = await Transaction.aggregate([
    { $match: { createdAt: { $lte: date } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  return result[0]?.total || 0;
};
