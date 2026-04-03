import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * 🔥 ADMIN SUMMARY
 */
router.get("/summary", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ activation_status: "active" });

    const totalIncome = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$totalIncome" } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalIncome: totalIncome[0]?.total || 0
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔥 ALL USERS
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().limit(100);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;