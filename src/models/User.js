import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({

  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["admin", "subadmin", "associate", "customer"],
    default: "customer"
  },

  referralId: { type: String, unique: true },

  sponsorId: { type: String, default: null },

  // 🔥 OLD SYSTEM (KEEPED SAFE)
  leftUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  rightUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // 🔥 NEW MLM SYSTEM (IMPORTANT)
  parentId: { type: String, default: null },
  leftChild: { type: String, default: null },
  rightChild: { type: String, default: null },

  placement: {
    type: String,
    enum: ["left", "right"],
    default: null
  },

  directCount: { type: Number, default: 0 },

  leftBusiness: { type: Number, default: 0 },
  rightBusiness: { type: Number, default: 0 },

  wallet_balance: { type: Number, default: 0 },
  todayIncome: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },

  directIncome: { type: Number, default: 0 },
  binaryIncome: { type: Number, default: 0 },
  levelIncome: { type: Number, default: 0 },
  roiIncome: { type: Number, default: 0 },
  royaltyIncome: { type: Number, default: 0 },

  // 🔥 DAILY TRACKING (MLM CALCULATION)
  todayDirect: { type: Number, default: 0 },
  todayBinary: { type: Number, default: 0 },
  todayLevel: { type: Number, default: 0 },
  todayROI: { type: Number, default: 0 },

  teamCount: { type: Number, default: 0 },
  activeTeam: { type: Number, default: 0 },

  packageAmount: { type: Number, default: 0 },
  propertyAmount: { type: Number, default: 0 },

  totalWithdraw: { type: Number, default: 0 },

  activation_status: {
    type: String,
    enum: ["inactive", "active"],
    default: "inactive"
  },

  isVerified: { type: Boolean, default: false },

  lastIncomeDate: { type: Date }

}, { timestamps: true });


// 🔐 PASSWORD HASHING
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// 🔥 AUTO REFERRAL ID GENERATE
userSchema.pre("save", function(next) {
  if (!this.referralId) {
    const random = Math.floor(1000 + Math.random() * 9000);
    this.referralId = "NEXT" + random;
  }
  next();
});

export default mongoose.model("User", userSchema);