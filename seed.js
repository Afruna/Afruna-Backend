"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// seedTransactions.ts
const Transaction_1 = __importDefault(require("@models/Transaction"));
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URI = 'mongodb://admin:afrunadmin@152.53.249.30:27017/afruna?authSource=admin';
function updateAllTransactions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(MONGO_URI);
            console.log('Connected to MongoDB');
            const result = yield Transaction_1.default.updateMany({}, // filter: match all transactions
            {
                $set: {
                    source: 'marketplace'
                },
            });
            console.log(`✅ Updated ${result.modifiedCount} transactions`);
        }
        catch (error) {
            console.error('Error updating transactions:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB');
        }
    });
}
updateAllTransactions();
