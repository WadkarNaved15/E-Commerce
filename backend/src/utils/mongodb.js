// Connect to MongoDB
import mongoose from 'mongoose';

const uri = "mongodb+srv://navedwadkar:9321869880@instagram.cbzhjlt.mongodb.net/?retryWrites=true&w=majority&appName=Instagram";
const dbName = 'Ecommerce'; 

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(uri, {
      dbName: dbName, 
    });

    cachedDb = db;

    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}