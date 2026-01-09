// backend/routes/participantRoutes.js
import express from "express";
import { joinExam, submitAnswerRest } from "../controllers/participantController.js";

const router = express.Router();

router.post("/join", joinExam);
router.post("/submit", submitAnswerRest); // REST fallback

export default router;
