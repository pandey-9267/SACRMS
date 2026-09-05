import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required. Add it to .env before starting the API.');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
