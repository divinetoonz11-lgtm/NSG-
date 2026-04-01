import mongoose from "mongoose";

const supportSchema = new mongoose.Schema({

  // User (referralId based)
  userId: {
    type: String,
    required: true
  },

  // Subject
  subject: {
    type: String,
    required: true
  },

  // Message
  message: {
    type: String,
    required: true
  },

  // Status
  status: {
    type: String,
    enum: ["open", "in_progress", "closed"],
    default: "open"
  },

  // Admin reply
  reply: {
    type: String
  },

  // Priority
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  }

}, { timestamps: true });

export default mongoose.model("Support", supportSchema);