import { creditWallet } from "./wallet.js";

export const processDirect = async (user) => {

  if (!user.sponsorId) return;

  let percent = 0;

  if (user.propertyAmount > 0) {
    percent = 0.05; // 5%
  } else {
    percent = 0.40; // 40%
  }

  const income = user.packageAmount * percent;

  await creditWallet({
    userId: user.sponsorId,
    amount: income,
    type: "direct",
    sourceUser: user.referralId,
    plan: user.propertyAmount > 0 ? "property" : "joining"
  });
};