import User from "../models/User.js";
import { creditWallet } from "./wallet.js";

const getDailyCapping = (packageAmount) => {
  if (packageAmount === 5000) return 1000;
  if (packageAmount === 10000) return 2000;
  if (packageAmount === 25000) return 5000;
  if (packageAmount === 50000) return 10000;
  return packageAmount * 0.4;
};

export const processBinary = async (userId, amount, plan = "joining") => {
  try {

    let currentUser = await User.findOne({ referralId: userId });

    while (currentUser?.parentId) {

      const parent = await User.findOne({ referralId: currentUser.parentId });
      if (!parent) break;

      // ✅ BUSINESS ADD
      if (parent.leftChild === currentUser.referralId) {
        parent.leftBusiness = (parent.leftBusiness || 0) + amount;
      } else if (parent.rightChild === currentUser.referralId) {
        parent.rightBusiness = (parent.rightBusiness || 0) + amount;
      }

      // ✅ 2 ACTIVE DIRECT REQUIRED
      const activeDirects = await User.countDocuments({
        sponsorId: parent.referralId,
        activation_status: "active"
      });

      if (activeDirects < 2) {
        await parent.save();
        currentUser = parent;
        continue;
      }

      let left = parent.leftBusiness || 0;
      let right = parent.rightBusiness || 0;

      let pairCount = 0;

      // 🔥 2:1 MATCH
      if (left >= amount * 2 && right >= amount) {
        pairCount = Math.floor(Math.min(left / (amount * 2), right / amount));

        parent.leftBusiness -= pairCount * amount * 2;
        parent.rightBusiness -= pairCount * amount;
      }

      // 🔥 1:2 MATCH
      else if (right >= amount * 2 && left >= amount) {
        pairCount = Math.floor(Math.min(right / (amount * 2), left / amount));

        parent.rightBusiness -= pairCount * amount * 2;
        parent.leftBusiness -= pairCount * amount;
      }

      if (pairCount > 0) {

        // ✅ PLAN BASED %
        let percent = 0;

        if (plan === "property") {
          percent = 0.06; // 6%
        } else {
          percent = 0.20; // 20%
        }

        let income = pairCount * amount * percent;

        // 🔥 GLOBAL CAPPING
        const maxDaily = getDailyCapping(parent.packageAmount);

        const totalToday =
          (parent.todayBinary || 0) +
          (parent.todayLevel || 0) +
          (parent.todayDirect || 0) +
          (parent.todayROI || 0);

        if (totalToday >= maxDaily) {
          income = 0;
        } else if (totalToday + income > maxDaily) {
          income = maxDaily - totalToday;
        }

        if (income > 0) {

          parent.todayBinary = (parent.todayBinary || 0) + income;

          await parent.save();

          await creditWallet({
            userId: parent.referralId,
            amount: income,
            type: "binary",
            sourceUser: userId,
            plan
          });

        } else {
          await parent.save();
        }

      } else {
        await parent.save();
      }

      currentUser = parent;
    }

  } catch (err) {
    console.error("Binary Error:", err.message);
  }
};