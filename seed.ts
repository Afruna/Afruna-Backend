// seedAdmin.ts
import Product from '@models/Product';
import mongoose from 'mongoose';


const MONGO_URI = 'mongodb://admin:afrunadmin@152.53.249.30:27017/afruna?authSource=admin'; // replace with your actual 

async function updateAllProducts() {
  await mongoose.connect(MONGO_URI);

  const result = await Product.updateMany(
    {}, // filter: match all
    {
      $set: {
        quantity: 99999999,
        isOutOfStock: false
      },
    }
  );

  console.log(`✅ Updated ${result.modifiedCount} products`);

  await mongoose.disconnect();
}

updateAllProducts();
