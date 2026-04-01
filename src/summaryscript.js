import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import User from "./models/User.js";
import Property from "./models/Property.js";

// 🔥 FIX: Load .env from ROOT (api folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 ये line सबसे important है
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ========================
// ▶️ MAIN FUNCTION
// ========================
(async () => {
  try {
    // 🔥 DEBUG (देखो load हुआ या नहीं)
    console.log("ENV MONGO_URI:", process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI STILL NOT LOADING ❌");
    }

    // 🔥 DB CONNECT
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const allUsers = await User.find().sort({ totalIncome: -1 });
    const allProperties = await Property.find();

    let company = {
      joiningBusiness: 0,
      propertyBusiness: 0,
      totalDirect: 0,
      totalBinary: 0,
      totalLevel: 0,
      totalROI: 0,
      totalRoyalty: 0,
      totalPayout: 0
    };

    const userSummary = allUsers.map(u => {

      const isProperty = (u.propertyAmount || 0) > 0;

      if (isProperty) {
        company.propertyBusiness += u.packageAmount || 0;
      } else {
        company.joiningBusiness += u.packageAmount || 0;
      }

      company.totalDirect += u.directIncome || 0;
      company.totalBinary += u.binaryIncome || 0;
      company.totalLevel += u.levelIncome || 0;
      company.totalROI += u.roiIncome || 0;
      company.totalRoyalty += u.royaltyIncome || 0;
      company.totalPayout += u.totalIncome || 0;

      return {
        name: u.name,
        referralId: u.referralId,
        packageAmount: u.packageAmount || 0,
        propertyAmount: u.propertyAmount || 0,
        directIncome: u.directIncome || 0,
        binaryIncome: u.binaryIncome || 0,
        levelIncome: u.levelIncome || 0,
        roiIncome: u.roiIncome || 0,
        royaltyIncome: u.royaltyIncome || 0,
        totalIncome: u.totalIncome || 0
      };
    });

    const totalBusiness =
      company.joiningBusiness + company.propertyBusiness;

    const finalReport = {
      totalBusiness,
      joiningBusiness: company.joiningBusiness,
      propertyBusiness: company.propertyBusiness,
      totalPayout: company.totalPayout,
      profit: totalBusiness - company.totalPayout,
      breakdown: {
        direct: company.totalDirect,
        binary: company.totalBinary,
        level: company.totalLevel,
        roi: company.totalROI,
        royalty: company.totalRoyalty
      },
      generatedAt: new Date()
    };

    console.log("📊 COMPANY SUMMARY");
    console.table([finalReport]);

    console.log("📊 USER SUMMARY");
    console.table(userSummary);

    fs.writeFileSync(
      "summary_report.json",
      JSON.stringify(
        { company: finalReport, users: userSummary },
        null,
        2
      )
    );

    console.log("📁 Report saved: summary_report.json");

    await mongoose.disconnect();
    console.log("🔌 DB Disconnected");

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  }
})();