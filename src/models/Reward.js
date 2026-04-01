import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  level: String,
  reward: String,
  achievedAt: Date

}, { timestamps: true });

export default mongoose.model("Reward", rewardSchema);