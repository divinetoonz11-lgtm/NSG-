import mongoose from "mongoose";

const royaltySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Royalty Type
  type: {
    type: String, // global / club / leadership
  },

  // Amount
  amount: {
    type: Number,
    default: 0
  },

  // Source Info
  source: {
    type: String // pool / company / matching
  },

  // Status
  status: {
    type: String,
    default: "pending" // pending / paid
  },

  // Date
  creditedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export default mongoose.model("Royalty", royaltySchema);