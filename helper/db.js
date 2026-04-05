import mongoose from "mongoose";

/**
 * MongoDB connection. Uses `process.env.MONGO_DB_URL`.
 * Database name: `process.env.MONGO_DB_NAME` or default `unnao-express`.
 * Admin login (`/api/backoffice/login`) uses the `users` collection via `models/user.js`.
 */
export async function connectDB() {
  const url = process.env.MONGO_DB_URL?.trim();
  if (!url) {
    throw new Error("MONGO_DB_URL is not set");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const dbName = process.env.MONGO_DB_NAME || "unnao-express";

  const { connection } = await mongoose.connect(url, {
    dbName,
    // Fail fast on Vercel/serverless so the browser is not stuck loading for the default ~30s.
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 8_000,
  });
  console.log("connect database");
  return connection;
}
