import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

// ========================
// ✅ सही IMPORTS (NO ./src/)
// ========================

// Models
import User from "./models/User.js";

// Utils
import { creditWallet } from "./utils/wallet.js";
import { processBinary } from "./utils/binary.js";
import { processLevelIncome } from "./utils/level.js";
import { processROI } from "./utils/roi.js";
import { processRoyalty } from "./utils/royalty.js";
import { checkRewards } from "./utils/reward.js";

dotenv.config();

// ========================
// 🚀 MAIN FUNCTION
// ========================
const runMLM = async () => {
  try {
    // ========================
    // 🔥 DB CONNECT
    // ========================
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // ========================
    // 🔥 FETCH ACTIVE USERS
    // ========================
    const users = await User.find({ activation_status: "active" });
    console.log(`🔥 Total Active Users: ${users.length}`);

    // ========================
    // ⚡ STEP 1: DIRECT INCOME
    // ========================
    console.log("⚡ STEP 1: DIRECT INCOME");

    for (const user of users) {
      if (user.sponsorId) {
        await creditWallet({
          userId: user.sponsorId,
          amount: (user.packageAmount || 0) * 0.4,
          type: "direct",
          sourceUser: user.referralId,
          plan: user.propertyAmount > 0 ? "property" : "joining"
        });
      }
    }

    // ========================
    // ⚡ STEP 2: BINARY + LEVEL + ROI + REWARD
    // ========================
    console.log("⚡ STEP 2: BINARY + LEVEL + ROI + REWARD");

    let totalBusiness = 0;

    for (const user of users) {
      const planType = user.propertyAmount > 0 ? "property" : "joining";

      totalBusiness += user.packageAmount || 0;

      // Binary
      await processBinary(
        user.referralId,
        user.packageAmount || 0,
        planType
      );

      // Level Income
      await processLevelIncome(
        user.referralId,
        user.packageAmount || 0,
        planType
      );

      // ROI
      await processROI(user);

      // Reward
      await checkRewards(user);
    }

    console.log("✅ MLM + ROI DONE");

    // ========================
    // ⚡ STEP 3: ROYALTY
    // ========================
    console.log("⚡ STEP 3: ROYALTY");

    await processRoyalty(totalBusiness);

    console.log("👑 ROYALTY DISTRIBUTED");

    // ========================
    // 📊 USER STATEMENTS
    // ========================
    const allUsers = await User.find().sort({ totalIncome: -1 });

    const userStatements = allUsers.map(u => ({
      name: u.name,
      referralId: u.referralId,
      sponsorId: u.sponsorId,
      totalIncome: u.totalIncome || 0,
      directIncome: u.directIncome || 0,
      binaryIncome: u.binaryIncome || 0,
      levelIncome: u.levelIncome || 0,
      roiIncome: u.roiIncome || 0,
      royaltyIncome: u.royaltyIncome || 0,
      walletBalance: u.wallet_balance || 0,
      packageAmount: u.packageAmount || 0,
      propertyAmount: u.propertyAmount || 0,
      cappingLoss: u.cappingLoss || 0,
      activation_status: u.activation_status
    }));

    console.log("📊 FULL USER STATEMENTS");
    console.table(userStatements);

    // ========================
    // 📊 COMPANY REPORT
    // ========================
    let totalPayout = 0,
        totalDirect = 0,
        totalBinary = 0,
        totalLevel = 0,
        totalROI = 0,
        totalRoyalty = 0,
        totalCappingLoss = 0;

    userStatements.forEach(u => {
      totalPayout += u.totalIncome;
      totalDirect += u.directIncome;
      totalBinary += u.binaryIncome;
      totalLevel += u.levelIncome;
      totalROI += u.roiIncome;
      totalRoyalty += u.royaltyIncome;
      totalCappingLoss += u.cappingLoss;
    });

    const companyReport = {
      totalBusiness,
      totalPayout,
      profit: totalBusiness - totalPayout,
      breakdown: {
        direct: totalDirect,
        binary: totalBinary,
        level: totalLevel,
        roi: totalROI,
        royalty: totalRoyalty
      },
      cappingLoss: totalCappingLoss,
      netProfitAfterCapping:
        (totalBusiness - totalPayout) + totalCappingLoss,
      generatedAt: new Date()
    };

    console.log("📊 COMPANY SUMMARY");
    console.table([companyReport]);

    // ========================
    // 📁 SAVE REPORT
    // ========================
    fs.writeFileSync(
      "mlm_report.json",
      JSON.stringify(
        {
          companyReport,
          userStatements
        },
        null,
        2
      )
    );

    console.log("📁 Report saved: mlm_report.json");

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 DB Disconnected");
    process.exit();
  }
};

// ========================
// ▶️ RUN
// ========================
runMLM();