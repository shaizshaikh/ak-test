// backend/controllers/participantController.js
import Participant from "../models/Participant.js";
import Question from "../models/Question.js";
import Exam from "../models/Exam.js";

export const joinExam = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: "Name and code required" });

    const exam = await Exam.findOne({ code });
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const participant = new Participant({ name: name.trim(), examCode: code });
    await participant.save();

    // do NOT send all questions here — participants should receive via socket when exam starts
    res.json({ message: "Joined", participantId: participant._id, examStarted: exam.started });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REST fallback for submit (Socket flow preferred)
export const submitAnswerRest = async (req, res) => {
  try {
    const { participantId, questionId, answerIndex, timeTaken /* seconds */ } = req.body;
    if (!participantId || !questionId) return res.status(400).json({ message: "Missing parameters" });

    const participant = await Participant.findById(participantId);
    const question = await Question.findById(questionId);
    if (!participant || !question) return res.status(404).json({ message: "Participant or question not found" });

    const correct = question.correctOptionIndex === answerIndex;
    const pointsEarned = correct ? 500 + Math.max(0, 100 - Math.round(timeTaken || 0)) : 0;

    participant.answers.push({ questionId, answerIndex, correct, timeTaken });
    if (correct) participant.correctCount += 1;
    participant.points += pointsEarned;
    participant.totalResponseTime += (timeTaken || 0);
    await participant.save();

    res.json({ message: "Answer recorded", participant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
