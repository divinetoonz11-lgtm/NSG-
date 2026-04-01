import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./src/models/User.js";  // ✅ Correct path

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB Connected");

// PASSWORDS
const universalPassword = await bcrypt.hash("Tanvi@29102910", 10);

// OPTIONS
const packageOptions = [10000, 15000, 20000, 25000];
const propertyOptions = [100000, 200000, 500000, 1000000];
const randomChoice = arr => arr[Math.floor(Math.random() * arr.length)];
const randomBool = (percentTrue) => Math.random() < percentTrue;

// CLEAR DB
await User.deleteMany();

// ========================
// COMPANY ROOT
// ========================
const company = await User.create({
  name: "Company",
  email: "company@test.com",
  referralId: "CMP" + Date.now(),
  sponsorId: null,
  password: universalPassword,
  role: "admin",
  activation_status: "active"
});

// ========================
// INDER ROOT
// ========================
const inder = await User.create({
  name: "Inder",
  email: "inder@test.com",
  referralId: "INDER001",
  sponsorId: company.referralId,
  password: universalPassword,
  packageAmount: randomChoice(packageOptions),
  propertyAmount: randomChoice(propertyOptions),
  activation_status: "active",
  role: "user",
  leftBusiness: 0,
  rightBusiness: 0,
  directCount: 0
});

console.log("✅ Root Ready");

// ========================
// TREE GENERATION
// ========================
const totalLevels = 8; // 2:4:8:16:32:64:128:256
let previousLevel = [inder];

for (let level = 1; level <= totalLevels; level++) {
  let currentLevel = [];

  for (let parent of previousLevel) {
    const numChildren = randomBool(0.8) ? 2 : 1; // 80% 2 direct, 20% 1 direct

    for (let i = 0; i < numChildren; i++) {
      const side = i === 0 ? "left" : "right";

      const packageAmount = randomChoice(packageOptions);
      const propertyAmount = randomChoice(propertyOptions);
      const isActive = randomBool(0.9); // 90% active, 10% inactive

      const newUser = await User.create({
        name: `User_L${level}_${side}_${parent.referralId}`,
        email: `user_${Date.now()}_${Math.random()}@test.com`,
        password: universalPassword,
        referralId: "USR" + Date.now() + Math.floor(Math.random() * 1000),
        sponsorId: parent.referralId,
        packageAmount,
        propertyAmount,
        propertyType: propertyAmount > 0 ? "property" : null,
        wallet_balance: 0,
        totalIncome: 0,
        directIncome: 0,
        binaryIncome: 0,
        levelIncome: 0,
        roiIncome: 0,
        royaltyIncome: 0,
        leftBusiness: packageAmount,
        rightBusiness: packageAmount,
        activation_status: isActive ? "active" : "inactive",
        role: "user",
        directCount: 0
      });

      // DIRECT COUNT
      await User.updateOne(
        { referralId: parent.referralId },
        { $inc: { directCount: 1 } }
      );

      // LEFT/RIGHT attach
      if (side === "left" && !parent.leftUser) parent.leftUser = newUser.referralId;
      if (side === "right" && !parent.rightUser) parent.rightUser = newUser.referralId;
      await parent.save();

      currentLevel.push(newUser);
    }
  }

  previousLevel = currentLevel;
}

console.log("✅ MLM Tree Ready (2:4:8:16…256)");
process.exit();