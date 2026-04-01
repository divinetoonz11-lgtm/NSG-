import mongoose from "mongoose";
import logger from "../utils/logger.js";

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) {
      logger.info("MongoDB already connected");
      return;
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "mlm",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = conn.connections[0].readyState === 1;

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("MongoDB connection error:", error.message);

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export default connectDB;