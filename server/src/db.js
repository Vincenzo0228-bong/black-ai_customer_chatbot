import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDb() {
  if (!config.mongodbUri) {
    throw new Error("Missing MONGODB_URI (set it in server/.env or environment).");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongodbUri);
  return mongoose.connection;
}


