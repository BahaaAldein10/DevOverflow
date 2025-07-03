import mongoose from 'mongoose';

let isConnected = false;

export const connectToDatabase = async () => {
  mongoose.set('strict', true);

  if (!process.env.DATABASE_URL) {
    return console.log('DATABASE_URL is missing!');
  }

  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      dbName: 'devflow',
    });

    isConnected = true;
  } catch (error) {
    console.log('MongoDB connection failed', error);
  }
};
