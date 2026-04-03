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
    // ❌ ACTIVE CHECK
    // ========================
    if (user.activation_status !== "active") {
      return { success: false, message: "User inactive" };
    }

    // ========================
    // ❌ PACKAGE CHECK
    // ========================
    if (!user.packageAmount || user.packageAmount <= 0) {
      return { success: false, message: "Invalid package" };
    }

    // ========================
    // 🔥 GLOBAL CAPPING
    // ========================
    const maxDaily = getDailyCapping(user.packageAmount);

    const totalToday =
      (user.todayBinary || 0) +
      (user.todayLevel || 0) +
      (user.todayDirect || 0) +
      (user.todayROI || 0) +
      (user.todayRoyalty || 0);

    let payableAmount = amount;

    if (totalToday >= maxDaily) {
      return { success: false, message: "Daily capping reached" };
    }

    if (totalToday + amount > maxDaily) {
      payableAmount = maxDaily - totalToday;
    }

    if (payableAmount <= 0) {
      return { success: false, message: "No payable amount" };
    }

    // ========================
    // ❌ DUPLICATE CHECK (OPTIONAL)
    // ========================
    const existing = await Income.findOne({
      userId,
      type,
      sourceUser,
      plan,
      amount: payableAmount
    });

    if (existing) {
      return { success: false, message: "Duplicate income blocked" };
    }

    // ========================
    // 💰 WALLET UPDATE
    // ========================
    user.wallet_balance = (user.wallet_balance || 0) + payableAmount;
    user.totalIncome = (user.totalIncome || 0) + payableAmount;

    // ========================
    // 🔥 TYPE BASE UPDATE
    // ========================
    if (type === "direct") {
      user.directIncome = (user.directIncome || 0) + payableAmount;
      user.todayDirect = (user.todayDirect || 0) + payableAmount;
    }

    if (type === "binary") {
      user.binaryIncome = (user.binaryIncome || 0) + payableAmount;
      user.todayBinary = (user.todayBinary || 0) + payableAmount;
    }

    if (type === "level") {
      user.levelIncome = (user.levelIncome || 0) + payableAmount;
      user.todayLevel = (user.todayLevel || 0) + payableAmount;
    }

    if (type === "roi") {
      user.roiIncome = (user.roiIncome || 0) + payableAmount;
      user.todayROI = (user.todayROI || 0) + payableAmount;
    }

    if (type === "royalty") {
      user.royaltyIncome = (user.royaltyIncome || 0) + payableAmount;
      user.todayRoyalty = (user.todayRoyalty || 0) + payableAmount;
    }

    await user.save();

    // ========================
    // 📊 INCOME RECORD
    // ========================
    const income = await Income.create({
      userId,
      type,
      amount: payableAmount,
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
      amount: payableAmount,
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