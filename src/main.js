import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// ✅ ROUTES
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payment.js";
import userRoutes from "./routes/users.js";

// 🔥 NEW ROUTES (ADD)
import adminRoutes from "./routes/admin.js";
import withdrawRoutes from "./routes/withdraw.js";
import dashboardRoutes from "./routes/dashboard.js";

// ✅ CRON
import { startDailyJob } from "./cron/dailyJob.js";

dotenv.config();

const app = express();

// ========================
// 🔥 DATABASE CONNECT
// ========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ========================
// 🔥 MIDDLEWARE
// ========================
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// ========================
// 🔥 ROOT ROUTES
// ========================
app.get("/", (req, res) => {
  res.send("🚀 NSG Backend is LIVE");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// ========================
// 🔥 API ROUTES
// ========================

// 🔐 AUTH (signup, login, activate)
app.use("/api/auth", authRoutes);

// 💳 PAYMENT
app.use("/api/payment", paymentRoutes);

// 👥 USERS (tree, team, profile)
app.use("/api/users", userRoutes);

// 📊 ADMIN PANEL
app.use("/api/admin", adminRoutes);

// 💸 WITHDRAW SYSTEM
app.use("/api/withdraw", withdrawRoutes);

// 📈 USER DASHBOARD
app.use("/api/dashboard", dashboardRoutes);

// ========================
// 🔥 SERVER START
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);

  // 🔥 START DAILY CRON (ROI etc.)
  startDailyJob();
});