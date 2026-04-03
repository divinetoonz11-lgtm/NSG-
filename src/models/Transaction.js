import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({

  // 🔥 USER LINK (FIXED)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // 🔥 REFERRAL ID (extra tracking)
  referralId: {
    type: String,
    required: true
  },

  // 🔥 AMOUNT
  amount: {
    type: Number,
    required: true
  },

  // 🔥 TYPE (IMPROVED)
  type: {
    type: String,
    enum: ["credit", "debit", "withdraw", "income"],
    required: true
  },

  // 🔥 SOURCE
  source: {
    type: String,
    default: "system"
  },

  // 🔥 REFERENCE
  referenceId: {
    type: String
  },

  // 🔥 STATUS (FIXED FOR WITHDRAW FLOW)
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed", "failed"],
    default: "pending"
  },

  // 🔥 NOTE
  remark: {
    type: String
  }

}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);