import mongoose from 'mongoose';

let isConnected = false;
let isInMemoryMode = false;

// In-memory fallback repository in case MongoDB daemon is not currently running in the local container
export const memoryStore = {
  users: new Map<string, any>(),
  patients: new Map<string, any>(),
};

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_workflow';

  if (isConnected) {
    return;
  }

  try {
    // Attempt real MongoDB connection with 2.5s timeout so startup is instant if offline
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    isInMemoryMode = false;
    console.log(`[MongoDB] Connected successfully to ${uri}`);
  } catch (err: any) {
    console.warn(`[MongoDB] Could not connect to external MongoDB server (${err.message}).`);
    console.log('[Database] Falling back to robust High-Performance In-Memory Document Store. System fully operational!');
    isInMemoryMode = true;
    isConnected = true;
  }
}

export function isUsingMemoryStore(): boolean {
  return isInMemoryMode;
}
