import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({

  // User (referralId based)
  userId: {
    type: String,
    required: true
  },

  // Amount
  amount: {
    type: Number,
    required: true
  },

  // Type
  type: {
    type: String,
    enum: ["credit", "debit", "withdraw"],
    required: true
  },

  // Source (income / property / admin)
  source: {
    type: String,
    default: "system"
  },

  // Reference (Income ID / Property ID)
  referenceId: {
    type: String
  },

  // Status
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed"
  },

  // Note
  remark: {
    type: String
  }

}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);