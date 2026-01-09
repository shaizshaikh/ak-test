import express from "express";
import { getResults, recordAnswer } from "../controllers/resultController.js";

const router = express.Router();

// ✅ Fetch results for a given quiz/exam code
router.get("/:code", getResults);

// ✅ Record participant answer (optional)
router.post("/record", recordAnswer);

export default router;
