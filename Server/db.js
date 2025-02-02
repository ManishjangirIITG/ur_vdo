import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import dotenv from 'dotenv'

dotenv.config()
const MONGO_URI = process.env.DB_URL;

if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable not defined');
}

const conn = mongoose.createConnection(MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  ssl: true, // Required for Atlas
  tlsAllowInvalidCertificates: false // Keep false for production
});

let bucket;

conn.once('open', () => {
  bucket = new GridFSBucket(conn.db);
  console.log('Connected to MongoDB Atlas with GridFS');
});

conn.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

export { conn, bucket };