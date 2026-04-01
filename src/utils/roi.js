import Property from "../models/Property.js";
import User from "../models/User.js";
import { creditWallet } from "./wallet.js";

export const processROI = async () => {

  const properties = await Property.find({ status: "active" });

  for (let prop of properties) {

    // 🔥 1. CHECK MINIMUM 25% PAYMENT
    if (prop.paidAmount < prop.amount * 0.25) continue;

    // 🔥 2. DETERMINE PLAN TYPE
    const isRental = prop.planType === "rental";

    // monthly %
    const monthlyPercent = isRental ? 4 : 2;

    // max return
    const maxReturn = isRental ? prop.amount * 2 : prop.amount;

    // 🔥 3. STOP IF LIMIT REACHED
    if (prop.totalEarned >= maxReturn) continue;

    // 🔥 4. DAILY ROI CALCULATION
    const dailyROI = (prop.amount * monthlyPercent / 100) / 30;

    let payout = dailyROI;

    // 🔥 5. PREVENT OVERPAY
    if (prop.totalEarned + payout > maxReturn) {
      payout = maxReturn - prop.totalEarned;
    }

    if (payout <= 0) continue;

    // 🔥 6. GLOBAL DAILY CAPPING (VERY IMPORTANT)
    const user = await User.findOne({ referralId: prop.userId });

    const maxDaily = user.packageAmount * 2;

    const totalToday =
      (user.todayROI || 0) +
      (user.todayBinary || 0) +
      (user.todayLevel || 0) +
      (user.todayDirect || 0);

    if (totalToday >= maxDaily) continue;

    if (totalToday + payout > maxDaily) {
      payout = maxDaily - totalToday;
    }

    if (payout <= 0) continue;

    // 💰 CREDIT
    await creditWallet({
      userId: prop.userId,
      amount: payout,
      type: "roi",
      plan: prop.planType,
      propertyId: prop._id
    });

    // 🔥 UPDATE PROPERTY
    prop.totalEarned += payout;
    prop.lastPayoutDate = new Date();

    await prop.save();

    // 🔥 UPDATE USER DAILY
    user.todayROI = (user.todayROI || 0) + payout;
    await user.save();
  }
};