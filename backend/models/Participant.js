// backend/models/Participant.js
import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  examCode: { type: String, required: true, index: true },
  points: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  totalResponseTime: { type: Number, default: 0 }, // seconds
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      answerIndex: Number,
      correct: Boolean,
      timeTaken: Number
    }
  ],
  joinedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Participant", ParticipantSchema);
