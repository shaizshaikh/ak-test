// backend/models/Quiz.js
import mongoose from "mongoose";

// Question sub-schema
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctOption: { type: Number, required: true }, // index of correct option
});

// Main Quiz schema
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // unique quiz code
  questions: [questionSchema],
  status: { type: String, default: "pending" }, // pending | running | completed
  started: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Quiz", quizSchema);
