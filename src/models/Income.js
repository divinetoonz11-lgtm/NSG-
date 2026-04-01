import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({

  // किसको income मिला
  userId: {
    type: String,   // referralId based
    required: true
  },

  // Income type
  type: {
    type: String,
    enum: ["direct", "binary", "level", "roi", "royalty", "property_direct", "property_binary"],
    required: true
  },

  // Amount
  amount: {
    type: Number,
    required: true
  },

  // किससे आया (referralId)
  sourceUser: {
    type: String
  },

  // Level (for level income)
  level: {
    type: Number
  },

  // Plan (joining / property)
  plan: {
    type: String   // "joining" | "property"
  },

  // Property link (optional)
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property"
  },

  // Status
  status: {
    type: String,
    default: "credited"
  }

}, { timestamps: true });

export default mongoose.model("Income", incomeSchema);