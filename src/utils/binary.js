import User from "../models/User.js";
import { creditWallet } from "./wallet.js";
import { getPV } from "./pv.js";

// ========================
// 🔥 DAILY CAPPING
// ========================
const getDailyCapping = (packageAmount) => {
  if (packageAmount === 5000) return 1000;
  if (packageAmount === 10000) return 2000;
  if (packageAmount === 25000) return 5000;
  if (packageAmount === 50000) return 10000;
  return packageAmount * 0.4;
};

// ========================
// 🔥 BINARY PROCESS
// ========================
export const processBinary = async (userId, amount, plan = "joining") => {
  try {

    let currentUser = await User.findOne({ referralId: userId });

    while (currentUser?.parentId) {

      const parent = await User.findOne({ referralId: currentUser.parentId });
      if (!parent) break;

      // ========================
      // 🔥 PV CALCULATION
      // ========================
      let pv = getPV(amount, plan);

      if (pv <= 0) {
        currentUser = parent;
        continue;
      }

      // ========================
      // ✅ BUSINESS ADD (CARRY FORWARD)
      // ========================
      if (parent.leftChild === currentUser.referralId) {
        parent.leftBusiness = (parent.leftBusiness || 0) + pv;
      } 
      else if (parent.rightChild === currentUser.referralId) {
        parent.rightBusiness = (parent.rightBusiness || 0) + pv;
      }

      // ========================
      // 🔥 2 DIRECT COMPULSORY
      // ========================
      const activeDirects = await User.countDocuments({
        sponsorId: parent.referralId,
        activation_status: "active"
      });

      if (activeDirects < 2) {
        await parent.save();
        currentUser = parent;
        continue;
      }

      // ========================
      // 🔥 LEFT + RIGHT ACTIVE CHECK
      // ========================
      const leftDirect = await User.findOne({
        sponsorId: parent.referralId,
        placement: "left",
        activation_status: "active"
      });

      const rightDirect = await User.findOne({
        sponsorId: parent.referralId,
        placement: "right",
        activation_status: "active"
      });

      if (!leftDirect || !rightDirect) {
        await parent.save();
        currentUser = parent;
        continue;
      }

      let left = parent.leftBusiness || 0;
      let right = parent.rightBusiness || 0;

      let pairCount = 0;

      // ========================
      // 🔥 MATCH LOGIC (CARRY FORWARD SAFE)
      // ========================
      if (left > 0 && right > 0) {

        // 🔥 2:1 MATCH
        if (left >= right * 2) {

          pairCount = Math.floor(right);

          parent.leftBusiness -= pairCount * 2;
          parent.rightBusiness -= pairCount;
        }

        // 🔥 1:2 MATCH
        else if (right >= left * 2) {

          pairCount = Math.floor(left);

          parent.rightBusiness -= pairCount * 2;
          parent.leftBusiness -= pairCount;
        }
      }

      // ========================
      // 💰 INCOME CALCULATION
      // ========================
      if (pairCount > 0) {

        let percent = plan === "property" ? 0.06 : 0.20;

        // 🔥 PV → ₹ (1 PV = ₹1000)
        let income = pairCount * percent * 1000;

        // ========================
        // 🔥 DAILY CAPPING
        // ========================
        const maxDaily = getDailyCapping(parent.packageAmount);

        const totalToday =
          (parent.todayBinary || 0) +
          (parent.todayLevel || 0) +
          (parent.todayDirect || 0) +
          (parent.todayROI || 0);

        if (totalToday >= maxDaily) {
          income = 0;
        } 
        else if (totalToday + income > maxDaily) {
          income = maxDaily - totalToday;
        }

        // ========================
        // 💰 CREDIT WALLET
        // ========================
        if (income > 0) {

          parent.todayBinary = (parent.todayBinary || 0) + income;
          parent.binaryIncome = (parent.binaryIncome || 0) + income;

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

      // ========================
      // 🔁 MOVE UP
      // ========================
      currentUser = parent;
    }

  } catch (err) {
    console.error("Binary Error:", err.message);
  }
};