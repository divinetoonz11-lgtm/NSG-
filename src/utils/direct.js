import User from "../models/User.js";
import { creditWallet } from "./wallet.js";

export const processDirect = async (sponsorId, amount, plan = "joining") => {

  try {
    if (!sponsorId) return;

    const sponsor = await User.findOne({ referralId: sponsorId });
    if (!sponsor) return;

    let percent = 0;

    // 🔥 plan wise %
    if (plan === "property") {
      percent = 0.05; // 5%
    } else {
      percent = 0.40; // 40%
    }

    const income = amount * percent;

    if (income <= 0) return;

    // ✅ wallet credit
    await creditWallet({
      userId: sponsor.referralId,
      amount: income,
      type: "direct",
      sourceUser: sponsorId,
      plan
    });

  } catch (err) {
    console.error("Direct Income Error:", err.message);
  }
};