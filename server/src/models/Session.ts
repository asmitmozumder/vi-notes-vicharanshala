import mongoose from "mongoose";

const KeystrokeSchema = new mongoose.Schema({
  key: String,
  timestamp: Number,
  action: String,
});

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  keystrokes: [KeystrokeSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Session", SessionSchema);