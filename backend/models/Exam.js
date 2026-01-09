// backend/models/Exam.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: String, required: true },  // ✅ the correct answer text
  time: { type: Number, default: 2 },
});

const examSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["draft", "ready", "live", "ended"],
      default: "ready",
    },
    started: { type: Boolean, default: false },
    currentQuestionIndex: { type: Number, default: 0 },
    questions: [questionSchema], // ✅ embedded questions
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);
