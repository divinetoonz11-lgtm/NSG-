import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";  // corrected path

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB Connected");

await User.deleteMany({});
console.log("✅ All users deleted");

process.exit();