import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { creditWallet } from '../utils/wallet.js';
import { processBinary } from '../utils/binary.js';
import { processLevelIncome } from '../utils/level.js';

const router = express.Router();

/** 🔑 Generate 4-digit random referral ID */
const generateReferralId = async () => {
  let referralId;
  let exists = true;
  while (exists) {
    referralId = Math.floor(1000 + Math.random() * 9000).toString();
    const user = await User.findOne({ referralId });
    if (!user) exists = false;
  }
  return referralId;
};

/** 🔍 BFS Placement */
const findPlacement = async (sponsorId) => {
  const queue = [];
  const sponsor = await User.findOne({ referralId: sponsorId });
  if (!sponsor) throw new Error("Invalid sponsor");
  queue.push(sponsor);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current.leftChild) return { parent: current, position: 'left' };
    if (!current.rightChild) return { parent: current, position: 'right' };

    const left = await User.findOne({ referralId: current.leftChild });
    const right = await User.findOne({ referralId: current.rightChild });

    if (left) queue.push(left);
    if (right) queue.push(right);
  }
};

/** 🔑 SIGNUP */
router.post('/signup', async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { name, email, password, sponsorReferralId, packageAmount } = req.body;
    if (!name || !email || !password || !packageAmount)
      return res.status(400).json({ error: 'Missing required fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralId = await generateReferralId();

    let parent = null;
    let position = null;
    if (sponsorReferralId) {
      const placement = await findPlacement(sponsorReferralId);
      parent = placement.parent;
      position = placement.position;
    }

    const newUser = await User.create([{
      name,
      email,
      password: hashedPassword,
      referralId,
      sponsorId: sponsorReferralId || null,
      parentId: parent ? parent.referralId : null,
      position,
      packageAmount
    }], { session });

    if (parent) {
      if (position === 'left') parent.leftChild = referralId;
      else parent.rightChild = referralId;
      await parent.save({ session });
    }

    if (sponsorReferralId) {
      const directIncome = packageAmount * 0.40;
      await creditWallet({
        userId: sponsorReferralId,
        amount: directIncome,
        type: "direct",
        sourceUser: referralId,
        plan: "joining"
      });
    }

    await processBinary(referralId, packageAmount, "joining");
    await processLevelIncome(referralId, packageAmount);

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, data: newUser[0] });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
});

/** 🔑 LOGIN */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.referralId, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ MUST BE THE LAST LINE

export default router;