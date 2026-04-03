import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

// ✅ MLM IMPORTS
import {
  processDirect,
  processBinary,
  processLevelIncome,
  processROI,
  checkRewards,
  processRoyalty,
  findPlacement
} from '../utils/index.js';

const router = express.Router();

/** 🔑 Generate Referral ID */
const generateReferralId = async () => {
  let referralId;
  let exists = true;

  while (exists) {
    referralId = "NEXT" + Math.floor(1000 + Math.random() * 9000);
    const user = await User.findOne({ referralId });
    if (!user) exists = false;
  }

  return referralId;
};

/** 🔑 SIGNUP */
router.post('/signup', async (req, res) => {
  try {
    let { name, email, password, sponsorReferralId } = req.body;

    email = email.toLowerCase().trim();

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const referralId = await generateReferralId();

    let role = "customer";
    let parentId = null;
    let placement = null;

    // 🔥 SPONSOR CHECK + PLACEMENT
    if (sponsorReferralId) {
      const sponsor = await User.findOne({ referralId: sponsorReferralId });

      if (!sponsor) {
        return res.status(400).json({ error: 'Invalid sponsor ID' });
      }

      role = "associate";

      placement = await findPlacement(sponsorReferralId, "left");

      if (placement) {
        parentId = placement.parent.referralId;
      }
    }

    // ✅ CREATE USER
    const newUser = await User.create({
      name,
      email,
      password,
      referralId,
      role,
      sponsorId: sponsorReferralId || null,
      parentId: parentId,
      packageAmount: 0,
      propertyAmount: 0,
      activation_status: "inactive"
    });

    // 🔥 🔥 MAIN FIX: LINK PARENT (VERY IMPORTANT)
    if (placement && placement.parent) {
      const parent = await User.findOne({ referralId: parentId });

      if (parent) {
        if (placement.position === "left") {
          parent.leftChild = referralId;
        } else {
          parent.rightChild = referralId;
        }

        await parent.save();
      }
    }

    res.json({
      success: true,
      message: "Signup successful (Inactive user)",
      data: newUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/** 🔑 LOGIN */
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** 🔥 ACTIVATE USER */
router.post("/activate", async (req, res) => {
  try {
    const { email, packageAmount } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.activation_status === "active") {
      return res.json({ message: "Already active" });
    }

    // ✅ ACTIVATE
    user.activation_status = "active";
    user.packageAmount = packageAmount;

    // 🔥 ROLE FIX
    if (user.sponsorId) {
      user.role = "associate";
    }

    await user.save();

    // 🔥 MLM RUN
    if (user.sponsorId) {
      await processDirect(user.sponsorId, packageAmount, user.referralId);
      await processBinary(user.referralId, packageAmount, "joining");
      await processLevelIncome(user.referralId, packageAmount);
      await processROI();
      await checkRewards(user.referralId);
      await processRoyalty(user.referralId);
    }

    res.json({
      success: true,
      message: "User activated successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;