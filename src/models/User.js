import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  // Basic Info
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },

  role: {
    type: String,
    default: "user"
  },

  // MLM Identity
  referralId: { type: String, unique: true },
  sponsorId: { type: String, default: null },

  // Tree Structure (string based like your DB)
  leftUser: { type: String, default: null },
  rightUser: { type: String, default: null },

  // Directs
  directCount: { type: Number, default: 0 },

  // Business Volume
  leftBusiness: { type: Number, default: 0 },
  rightBusiness: { type: Number, default: 0 },

  // Wallet & Income
  wallet_balance: { type: Number, default: 0 },
  todayIncome: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },

  directIncome: { type: Number, default: 0 },
  binaryIncome: { type: Number, default: 0 },
  levelIncome: { type: Number, default: 0 },
  roiIncome: { type: Number, default: 0 },
  royaltyIncome: { type: Number, default: 0 },

  // Team Stats
  teamCount: { type: Number, default: 0 },
  activeTeam: { type: Number, default: 0 },

  // Packages
  packageAmount: { type: Number, default: 0 },
  propertyAmount: { type: Number, default: 0 },

  // Withdrawals
  totalWithdraw: { type: Number, default: 0 },

  // Status
  activation_status: {
    type: String,
    default: "inactive"
  },

  // Extra
  lastIncomeDate: { type: Date }

}, { timestamps: true });

export default mongoose.model("User", userSchema);