import User from "../models/User.js";
import { creditWallet } from "./wallet.js";

/**
 * 🧠 DESIGNATION ORDER
 */
const designationOrder = [
  "none", "foundation", "growth", "builder",
  "leader", "silver", "gold", "diamond",
  "crown", "global"
];

/**
 * 🔥 LEVEL CONFIG (20 LEVEL)
 */
const levelConfig = [
  { level: 1, percent: 5, required: "none" }, // ✅ ALWAYS INCOME
  { level: 2, percent: 3, required: "foundation" },
  { level: 3, percent: 2, required: "growth" },
  { level: 4, percent: 2, required: "builder" },
  { level: 5, percent: 1, required: "leader" },
  { level: 6, percent: 1, required: "silver" },
  { level: 7, percent: 1, required: "gold" },
  { level: 8, percent: 1, required: "diamond" },
  { level: 9, percent: 0.5, required: "crown" },
  { level: 10, percent: 0.5, required: "crown" },
  { level: 11, percent: 0.5, required: "crown" },
  { level: 12, percent: 0.5, required: "crown" },
  { level: 13, percent: 0.5, required: "crown" },
  { level: 14, percent: 0.5, required: "crown" },
  { level: 15, percent: 0.5, required: "crown" },
  { level: 16, percent: 0.5, required: "crown" },
  { level: 17, percent: 0.5, required: "crown" },
  { level: 18, percent: 0.5, required: "crown" },
  { level: 19, percent: 0.5, required: "crown" },
  { level: 20, percent: 0.5, required: "global" }
];

/**
 * 🔥 DAILY CAPPING
 */
const getDailyCapping = (pkg) => {
  if (pkg === 5000) return 1000;
  if (pkg === 10000) return 2000;
  if (pkg === 25000) return 5000;
  if (pkg === 50000) return 10000;
  return pkg * 0.4;
};

/**
 * 🔍 CHECK DESIGNATION
 */
const isEligible = (userDesignation, requiredDesignation) => {
  if (requiredDesignation === "none") return true;

  const userIndex = designationOrder.indexOf(userDesignation || "none");
  const requiredIndex = designationOrder.indexOf(requiredDesignation);

  return userIndex >= requiredIndex;
};

/**
 * 🔥 TEAM COUNT (recursive - same as your logic)
 */
const getTeamData = async (userId) => {
  if (!userId) return { total: 0 };

  const children = await User.find({ parentId: userId });

  let total = children.length;

  for (const child of children) {
    const res = await getTeamData(child.referralId);
    total += res.total;
  }

  return { total };
};

/**
 * 🧠 DESIGNATION CALC
 */
const calculateDesignation = (team) => {
  const total = team.total;

  if (total >= 100) return "global";
  if (total >= 70) return "crown";
  if (total >= 50) return "diamond";
  if (total >= 30) return "gold";
  if (total >= 20) return "silver";
  if (total >= 10) return "leader";
  if (total >= 6) return "builder";
  if (total >= 3) return "growth";
  if (total >= 1) return "foundation";

  return "none";
};

/**
 * 💰 FINAL LEVEL INCOME
 */
export const processLevelIncome = async (userId, amount, planType = "joining") => {

  let currentUser = await User.findOne({ referralId: userId });
  let index = 0;

  while (currentUser?.parentId && index < levelConfig.length) {

    const parent = await User.findOne({ referralId: currentUser.parentId });
    if (!parent) break;

    const config = levelConfig[index];

    // 🔥 LEVEL 1 ALWAYS INCOME (NO CONDITION)
    let eligible = false;

    if (config.level === 1) {
      eligible = true;
    } else {
      const teamData = await getTeamData(parent.referralId);
      const designation = calculateDesignation(teamData);
      eligible = isEligible(designation, config.required);
    }

    if (!eligible) {
      currentUser = parent;
      index++;
      continue;
    }

    let income = (amount * config.percent) / 100;

    // ========================
    // 🔥 GLOBAL CAPPING
    // ========================
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

      parent.todayLevel = (parent.todayLevel || 0) + income;
      await parent.save();

      await creditWallet({
        userId: parent.referralId,
        amount: income,
        type: "level",
        level: config.level,
        plan: planType,
        sourceUser: userId
      });

    } else {
      await parent.save();
    }

    currentUser = parent;
    index++;
  }
};