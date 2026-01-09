// backend/controllers/resultController.js
import Participant from "../models/Participant.js";
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";

// Fetch results for a quiz
export const getResults = async (req, res) => {
  try {
    const { code } = req.params;

    // First check if exam exists
    const exam = await Exam.findOne({ code });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Get results from Result collection (created during live exam)
    const results = await Result.find({ quiz: code });
    
    if (results.length > 0) {
      // Sort by points descending
      const sortedResults = results.sort((a, b) => (b.points || 0) - (a.points || 0));
      
      // Transform to match frontend expectations
      const transformedResults = sortedResults.map((result, index) => ({
        name: result.participantName,
        points: result.points || 0,
        accuracy: result.accuracy || 0,
        avgTime: result.avgTime || 0,
        rank: index + 1,
        totalAnswers: result.totalAnswers || 0,
        correctAnswers: result.correctAnswers || 0
      }));
      
      return res.json(transformedResults);
    }
    
    // Fallback: check participants collection (if no results saved yet)
    const participants = await Participant.find({ examCode: code }).sort({ points: -1 });
    
    const formatted = participants.map((p, index) => ({
      name: p.name,
      points: p.points || 0,
      accuracy: p.correctCount && p.answers ? Math.round((p.correctCount / p.answers.length) * 100) : 0,
      avgTime: p.totalResponseTime && p.answers ? Math.round(p.totalResponseTime / p.answers.length) : 0,
      rank: index + 1,
      totalAnswers: p.answers ? p.answers.length : 0,
      correctAnswers: p.correctCount || 0
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching results" });
  }
};

// Record participant answer (for live scoring)
export const recordAnswer = async (req, res) => {
  try {
    const { participantId, questionId, selectedOption, timeTaken } = req.body;

    const participant = await Participant.findById(participantId);
    if (!participant) return res.status(404).json({ message: "Participant not found" });

    // Update points
    const question = participant.quiz.questions.id(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    let points = 0;
    if (selectedOption === question.correctOption) {
      points += 500; // correct answer
      // TODO: add speed bonus logic
    }

    participant.points += points;
    participant.answers.push({
      questionId,
      selectedOption,
      points,
      timeTaken,
    });

    await participant.save();
    res.json({ message: "Answer recorded", points: participant.points });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
