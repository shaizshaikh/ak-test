// backend/models/Question.js
import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  examCode: { type: String, required: true, index: true },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctOptionIndex: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Question", QuestionSchema);
