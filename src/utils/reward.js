import User from "../models/User.js";

const rewards = [
  { level: 1, target: 50000, reward: "Training Kit" },
  { level: 2, target: 100000, reward: "Certificate" },
  { level: 3, target: 300000, reward: "Bike" },
  { level: 4, target: 700000, reward: "Trip" },
  { level: 5, target: 1500000, reward: "Car" }
];

export const checkRewards = async (userId) => {

  const user = await User.findOne({ referralId: userId });
  if (!user) return;

  const currentLevel = user.rewardLevel || 0;

  const nextReward = rewards.find(r => r.level === currentLevel + 1);

  if (!nextReward) return;

  // 🔥 ONLY CURRENT CYCLE INCOME
  const cycleIncome = user.rewardCycleIncome || 0;

  if (cycleIncome >= nextReward.target) {

    console.log(`🎉 Reward Unlocked: ${nextReward.reward}`);

    // 🔥 UPDATE USER
    user.rewardLevel = nextReward.level;

    // 🔥 RESET FOR NEXT REWARD (VERY IMPORTANT)
    user.rewardCycleIncome = 0;

    await user.save();
  }
};