// seedTransactions.ts
import Transaction from '@models/Transaction';
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://admin:afrunadmin@152.53.249.30:27017/afruna?authSource=admin';

async function updateAllTransactions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Transaction.updateMany(
      {}, // filter: match all transactions
      {
        $set: {
          source: 'marketplace'
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} transactions`);
  } catch (error) {
    console.error('Error updating transactions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateAllTransactions();
