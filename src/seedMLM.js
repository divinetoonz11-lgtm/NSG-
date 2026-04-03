import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

// ✅ FIXED PATH
import User from "./models/User.js";

// 🔥 FIX ENV PATH
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// CONNECT DB
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB Connected");

// PASSWORD
const password = await bcrypt.hash("Tanvi@2910", 10);

// OPTIONS
const packageOptions = [5000, 10000, 15000, 20000, 25000];
const propertyOptions = [100000, 200000, 300000, 500000];

const randomChoice = arr => arr[Math.floor(Math.random() * arr.length)];
const randomBool = (p) => Math.random() < p;

// CLEAR DB
await User.deleteMany();
console.log("🧹 Old data cleared");

// ========================
// ROOT USER
// ========================
const root = await User.create({
  name: "Jai Mata Di",
  email: "divinetoonz11@gmail.com",
  password,
  referralId: "ROOT001",
  role: "admin",
  activation_status: "active",
  parentId: null,
  leftChild: null,
  rightChild: null
});

console.log("✅ Root Created");

// ========================
// TREE BUILD (1→2→4→...)
// ========================
const maxLevels = 8;
let currentLevel = [root];

for (let level = 1; level <= maxLevels; level++) {
  let nextLevel = [];

  for (let parent of currentLevel) {

    for (let i = 0; i < 2; i++) {

      const side = i === 0 ? "left" : "right";

      const isActive = randomBool(0.9);     // 90% active
      const hasProperty = randomBool(0.3);  // 30% property

      const packageAmount = randomChoice(packageOptions);
      const propertyAmount = hasProperty ? randomChoice(propertyOptions) : 0;

      const referralId = "USR" + Date.now() + Math.floor(Math.random() * 1000);

      const user = await User.create({
        name: "Inder Mohan Singh",
        email: `user_${Date.now()}_${Math.random()}@test.com`,
        password,
        referralId,

        sponsorId: parent.referralId,
        parentId: parent.referralId,
        placement: side,

        leftChild: null,
        rightChild: null,

        packageAmount,
        propertyAmount,

        activation_status: isActive ? "active" : "inactive",
        role: "associate",

        leftBusiness: 0,
        rightBusiness: 0
      });

      // 🔥 LINK PARENT
      if (side === "left") {
        parent.leftChild = referralId;
      } else {
        parent.rightChild = referralId;
      }

      await parent.save();

      nextLevel.push(user);
    }
  }

  currentLevel = nextLevel;
}

console.log("🔥 MLM TREE READY (1 → 256)");
process.exit();