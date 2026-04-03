import cron from "node-cron";
import User from "../models/User.js";
import { processROI } from "../utils/roi.js";

export const startDailyJob = () => {

  cron.schedule("0 0 * * *", async () => {
    try {

      console.log("🔄 Daily Cron Started");

      const users = await User.find({
        activation_status: "active"
      });

      for (const user of users) {

        // reset daily income
        user.todayBinary = 0;
        user.todayDirect = 0;
        user.todayLevel = 0;
        user.todayROI = 0;
        user.todayRoyalty = 0;

        await user.save();

        // ROI trigger
        await processROI(user.referralId);
      }

      console.log("✅ Daily Cron Completed");

    } catch (err) {
      console.error("Cron Error:", err.message);
    }
  });

};