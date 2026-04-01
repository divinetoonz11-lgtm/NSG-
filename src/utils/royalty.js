import User from "../models/User.js";
import { creditWallet } from "./wallet.js";

export const processRoyalty = async (totalCompanyBusiness) => {

  if (!totalCompanyBusiness || totalCompanyBusiness <= 0) return;

  // 🔥 2% Pool
  const pool = totalCompanyBusiness * 0.02;

  // ✅ ONLY GLOBAL PARTNERS
  const users = await User.find({ designation: "global" });

  const qualifiedUsers = [];

  for (let user of users) {

    const left = user.monthlyLeftBusiness || 0;
    const right = user.monthlyRightBusiness || 0;

    const weakLeg = Math.min(left, right);
    const totalUserBusiness = left + right;

    // ❌ skip if no business
    if (totalUserBusiness <= 0) continue;

    // 🔥 weak leg ≥ 10%
    if (weakLeg < totalUserBusiness * 0.10) continue;

    qualifiedUsers.push(user);
  }

  if (qualifiedUsers.length === 0) return;

  const share = pool / qualifiedUsers.length;

  for (let user of qualifiedUsers) {

    await creditWallet({
      userId: user.referralId,
      amount: share,
      type: "royalty"
    });

  }

  // 🔁 Monthly reset
  for (let user of users) {
    user.monthlyLeftBusiness = 0;
    user.monthlyRightBusiness = 0;
    await user.save();
  }
};