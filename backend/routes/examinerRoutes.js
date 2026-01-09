import express from "express";
import {
  createExam,
  getExams,
  getExamByCode,
  startExam,
  endExam,
  deleteExam,
  getResults,
} from "../controllers/examinerController.js";

const router = express.Router();

// Create a new exam
router.post("/createExam", createExam);

// Get all exams (for Manage Quizzes)
router.get("/", getExams);

// Get a specific exam by code (for Live or Add Questions page)
router.get("/:code", getExamByCode);

// Start an exam
router.put("/:code/start", startExam);

// End an exam
router.put("/:code/end", endExam);

// Delete an exam
router.delete("/:code", deleteExam);

// Get exam results
router.get("/:code/results", getResults);

export default router;
