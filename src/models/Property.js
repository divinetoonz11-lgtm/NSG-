import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({

  // 👤 User Link (User referralId)
  userId: {
    type: String,
    required: false
  },

  // 💰 Investment / Property Amount
  amount: {
    type: Number,
    default: 0
  },

  // 🏗️ Plot Inventory
  totalPlots: {
    type: Number,
    default: 0
  },

  soldPlots: {
    type: Number,
    default: 0
  },

  availablePlots: {
    type: Number,
    default: 0
  },

  // 📊 Status
  propertyStatus: {
    type: String,
    enum: ["available", "soldout", "active", "closed"],
    default: "available"
  },

  // 🔥 Plan Type (ROI calculation)
  planType: {
    type: String,
    enum: ["rental", "owned"],
    default: "rental"
  },

  // 💰 Paid amount by user
  paidAmount: {
    type: Number,
    default: 0
  },

  // 💳 EMI Settings
  emiMonths: {
    type: Number,
    default: 24  // 24 months EMI
  },

  monthlyEMI: {
    type: Number,
    default: 0   // calculated automatically: amount / emiMonths
  },

  emiPaidMonths: {
    type: Number,
    default: 0
  },

  // 📈 Total ROI earned from this property
  totalEarned: {
    type: Number,
    default: 0
  },

  // 📅 Last payout date (for ROI)
  lastPayoutDate: {
    type: Date
  },

  // 📅 Created Date
  createdAt: {
    type: Date,
    default: Date.now
  }

});

// 🔹 Pre-save hook to calculate EMI
propertySchema.pre("save", function(next) {
  if (this.emiMonths > 0 && this.amount > 0) {
    this.monthlyEMI = this.amount / this.emiMonths;
  }
  next();
});

// 🔹 Index for faster queries on userId
propertySchema.index({ userId: 1 });

export default mongoose.model("Property", propertySchema);