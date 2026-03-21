import mongoose from "mongoose";

const KeystrokeSchema = new mongoose.Schema({
  action: { type: String, enum: ["down", "up", "paste"], required: true },
  timestamp: { type: Number, required: true },
  duration: Number,
  pasteLength: Number,
});

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  keystrokes: [KeystrokeSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Session", SessionSchema);