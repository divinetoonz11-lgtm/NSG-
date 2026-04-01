import mongoose from "mongoose";
import fs from "fs";
import User from "./models/User.js";

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");

    const users = await User.find();

    // ========================
    // 📊 COMPANY DAILY TOTAL
    // ========================
    let company = {
      totalDirect: 0,
      totalBinary: 0,
      totalLevel: 0,
      totalROI: 0,
      totalRoyalty: 0,
      totalPayout: 0
    };

    // ========================
    // 👤 USER DAILY SUMMARY
    // ========================
    const userSummary = users.map(u => {

      const todayDirect = u.todayDirect || 0;
      const todayBinary = u.todayBinary || 0;
      const todayLevel = u.todayLevel || 0;
      const todayROI = u.todayROI || 0;

      const totalToday =
        todayDirect +
        todayBinary +
        todayLevel +
        todayROI;

      // company totals
      company.totalDirect += todayDirect;
      company.totalBinary += todayBinary;
      company.totalLevel += todayLevel;
      company.totalROI += todayROI;

      return {
        name: u.name,
        referralId: u.referralId,
        todayDirect,
        todayBinary,
        todayLevel,
        todayROI,
        totalToday
      };
    });

    company.totalPayout =
      company.totalDirect +
      company.totalBinary +
      company.totalLevel +
      company.totalROI +
      company.totalRoyalty;

    // ========================
    // 📊 OUTPUT
    // ========================
    console.log("📊 DAILY COMPANY SUMMARY");
    console.table([company]);

    console.log("📊 USER DAILY SUMMARY");
    console.table(userSummary);

    // ========================
    // 📁 SAVE FILE
    // ========================
    fs.writeFileSync(
      "daily_payout.json",
      JSON.stringify(
        {
          company,
          userSummary,
          generatedAt: new Date()
        },
        null,
        2
      )
    );

    console.log("📁 Saved: daily_payout.json");

    await mongoose.disconnect();
    console.log("🔌 DB Disconnected");

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  }
})();