// seedAdmin.ts

import Admin from '@models/Admin';
import mongoose from 'mongoose';


const MONGO_URI = 'mongodb://admin:afrunadmin@152.53.249.30:27017/afruna?authSource=admin'; // replace with your actual Mongo URI

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await Admin.findOne({ email: 'eolaosebikan60@gmail.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const admin = new Admin({
      firstName: 'Olaosebikan',
      lastName: 'Emmanuel',
      email: 'eolaosebikan60@gmail.com',
      password: '12345678', // will be hashed by pre-save hook
      role: 'super-admin',
    });

    await admin.save();
    console.log('Admin created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedAdmin();
