// backend/controllers/quizController.js
import Exam from "../models/Exam.js";
import Participant from "../models/Participant.js"; // create a participant model
import mongoose from "mongoose";

// Create a new quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, code, questions } = req.body;

    const existing = await Exam.findOne({ code });
    if (existing) return res.status(400).json({ message: "Quiz code already exists" });

    const newExam = new Exam({
      title,
      code,
      questions, // questions array: [{questionText, options, correctOption}]
      status: "pending",
      started: false,
    });

    await newExam.save();
    res.status(201).json(newExam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Exam.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Start a quiz (live)
export const startQuiz = async (req, res) => {
  try {
    const { code } = req.params;
    const quiz = await Exam.findOne({ code });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    quiz.started = true;
    quiz.status = "running";
    await quiz.save();

    res.json({ message: "Quiz started", quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// End quiz
export const endQuiz = async (req, res) => {
  try {
    const { code } = req.params;
    const quiz = await Exam.findOne({ code });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    quiz.status = "completed";
    quiz.started = false;
    await quiz.save();

    res.json({ message: "Quiz ended", quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single quiz (for live exam control panel)
export const getQuizByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const quiz = await Exam.findOne({ code });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
