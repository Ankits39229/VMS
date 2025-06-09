import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface GlobalWithMongo extends NodeJS.Global {
  _mongoClientPromise?: Promise<MongoClient>;
}

declare const global: GlobalWithMongo;

const connectToDatabase = async (): Promise<{ client: MongoClient; db: Db }> => {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri!);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri!);
    clientPromise = client.connect();
  }

  const connectedClient = await clientPromise!;
  const dbName = new URL(uri!).pathname.substring(1); // Extract DB name from URI
  if (!dbName) {
    throw new Error('Database name not found in MONGODB_URI. Please ensure it is part of the connection string (e.g., /myDatabaseName?).');
  }
  const db = connectedClient.db(dbName);
  return { client: connectedClient, db };
};

export default connectToDatabase;
