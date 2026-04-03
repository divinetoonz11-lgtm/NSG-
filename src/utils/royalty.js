import User from "../models/User.js";
import { creditWallet } from "./wallet.js";

// ========================
// 🔥 ROYALTY PROCESS (WEAK LEG BASED ON EARNING)
// ========================
export const processRoyalty = async (totalCompanyBusiness) => {
  try {

    if (!totalCompanyBusiness || totalCompanyBusiness <= 0) return;

    // 🔥 2% COMPANY POOL
    const pool = totalCompanyBusiness * 0.02;

    // ✅ ONLY GLOBAL USERS
    const users = await User.find({ designation: "global" });

    const qualifiedUsers = [];

    for (let user of users) {

      // ========================
      // 🔥 USER TOTAL BINARY EARNING
      // ========================
      const totalBinary = user.binaryIncome || 0;

      // ❌ अगर कुछ कमाया ही नहीं
      if (totalBinary <= 0) continue;

      // ========================
      // 🔥 REQUIRED NEW BUSINESS (10%)
      // ========================
      const requiredBusiness = totalBinary * 0.10;

      // ========================
      // 🔥 MONTHLY NEW BUSINESS
      // ========================
      const left = user.monthlyLeftBusiness || 0;
      const right = user.monthlyRightBusiness || 0;

      const weakLeg = Math.min(left, right);

      // ❌ no new business
      if (weakLeg <= 0) continue;

      // ========================
      // 🔥 MAIN CONDITION
      // ========================
      if (weakLeg < requiredBusiness) continue;

      qualifiedUsers.push({
        user,
        weakLeg,
        requiredBusiness
      });
    }

    // ❌ कोई qualify नहीं हुआ
    if (qualifiedUsers.length === 0) return;

    // ========================
    // 🔥 EQUAL DISTRIBUTION
    // ========================
    const share = pool / qualifiedUsers.length;

    for (let data of qualifiedUsers) {

      const user = data.user;

      await creditWallet({
        userId: user.referralId,
        amount: share,
        type: "royalty",
        sourceUser: "company",
        plan: "royalty"
      });

      // 🔥 update stats
      user.royaltyIncome = (user.royaltyIncome || 0) + share;
      await user.save();
    }

    // ========================
    // 🔁 MONTHLY RESET
    // ========================
    for (let user of users) {
      user.monthlyLeftBusiness = 0;
      user.monthlyRightBusiness = 0;
      await user.save();
    }

  } catch (err) {
    console.error("Royalty Error:", err.message);
  }
};