import User from "../models/User.js";
import Income from "../models/Income.js";
import Transaction from "../models/Transaction.js";

// ========================
// 🔥 DAILY CAPPING
// ========================
const getDailyCapping = (pkg) => {
  if (pkg === 5000) return 1000;
  if (pkg === 10000) return 2000;
  if (pkg === 25000) return 5000;
  if (pkg === 50000) return 10000;
  return pkg * 0.4;
};

// ========================
// 💰 CREDIT WALLET
// ========================
export const creditWallet = async ({
  userId,
  amount,
  type,
  sourceUser = null,
  level = null,
  plan = "joining",
  propertyId = null
}) => {
  try {

    // ========================
    // 🔍 USER FIND
    // ========================
    const user = await User.findOne({ referralId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    // ========================
    // 🔥 GLOBAL CAPPING CHECK
    // ========================
    const maxDaily = getDailyCapping(user.packageAmount);

    const totalToday =
      (user.todayBinary || 0) +
      (user.todayLevel || 0) +
      (user.todayDirect || 0) +
      (user.todayROI || 0);

    if (totalToday >= maxDaily) {
      return { success: false, message: "Daily capping reached" };
    }

    if (totalToday + amount > maxDaily) {
      amount = maxDaily - totalToday;
    }

    if (amount <= 0) {
      return { success: false, message: "No payable amount after capping" };
    }

    // ========================
    // 💰 WALLET UPDATE
    // ========================
    user.wallet_balance = (user.wallet_balance || 0) + amount;
    user.totalIncome = (user.totalIncome || 0) + amount;

    // ========================
    // 🔥 TYPE BASE UPDATE
    // ========================
    if (type === "direct") {
      user.directIncome = (user.directIncome || 0) + amount;
      user.todayDirect = (user.todayDirect || 0) + amount;
    }

    if (type === "binary") {
      user.binaryIncome = (user.binaryIncome || 0) + amount;
      user.todayBinary = (user.todayBinary || 0) + amount;
    }

    if (type === "level") {
      user.levelIncome = (user.levelIncome || 0) + amount;
      user.todayLevel = (user.todayLevel || 0) + amount;
    }

    if (type === "roi") {
      user.roiIncome = (user.roiIncome || 0) + amount;
      user.todayROI = (user.todayROI || 0) + amount;
    }

    if (type === "royalty") {
      user.royaltyIncome = (user.royaltyIncome || 0) + amount;
    }

    await user.save();

    // ========================
    // 📊 INCOME RECORD
    // ========================
    const income = await Income.create({
      userId,
      type,
      amount,
      sourceUser,
      level,
      plan,
      propertyId
    });

    // ========================
    // 📒 TRANSACTION RECORD
    // ========================
    await Transaction.create({
      userId,
      amount,
      type: "credit",
      source: type,
      referenceId: income._id.toString(),
      status: "completed"
    });

    return { success: true };

  } catch (err) {
    console.error("Wallet Error:", err.message);
    return { success: false, error: err.message };
  }
};