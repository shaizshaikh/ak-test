// backend/models/Result.js
import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  quiz: { type: String, required: true, index: true }, // Changed from examCode to quiz
  participantName: { type: String, required: true }, // Changed from name to participantName
  points: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  avgTime: { type: Number, default: 0 },
  totalAnswers: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Result", ResultSchema);
