import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * 🔥 REQUEST WITHDRAW
 */
router.post("/request", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.wallet_balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    user.wallet_balance -= amount;
    user.totalWithdraw += amount;

    await user.save();

    res.json({ success: true, message: "Withdraw requested" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;