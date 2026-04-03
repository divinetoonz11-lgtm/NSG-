import express from "express";
import User from "../models/User.js";

import {
  processDirect,
  processBinary,
  processLevelIncome, // ✅ FIX
  processROI,
  checkRewards,       // ✅ FIX
  processRoyalty
} from "../utils/index.js";

const router = express.Router();

router.post("/activate", async (req, res) => {
  try {
    const { referralId, packageAmount } = req.body;

    const user = await User.findOne({ referralId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.activation_status === "active") {
      return res.json({ message: "Already active" });
    }

    // 🔥 activate
    user.activation_status = "active";
    user.packageAmount = packageAmount;

    await user.save();

    // 🔥 MLM RUN
    if (user.sponsorId) {
      await processDirect(user.sponsorId, packageAmount, user.referralId);
      await processBinary(user.referralId, packageAmount, "joining");
      await processLevelIncome(user.referralId, packageAmount); // ✅ FIX
      await processROI(); // ROI global hota hai
      await checkRewards(user.referralId); // ✅ FIX
      await processRoyalty(user.referralId);
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;