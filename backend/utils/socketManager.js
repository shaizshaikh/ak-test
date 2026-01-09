// backend/utils/socketManager.js
import Participant from "../models/Participant.js";
import Question from "../models/Question.js";
import Exam from "../models/Exam.js";

/*
  Behavior:
  - sockets join room named by examCode
  - examiner emits: startExam, nextQuestion, endExam
  - participants emit: submitAnswer
  - server updates Participant records and emits leaderboardUpdate to the room
*/

export default function socketManager(io) {
  // In-memory per-exam question answer order map (to compute bonus)
  const answerOrder = {}; // { examCode: { questionId: [participantId, ...] } }

  io.on("connection", (socket) => {

    socket.on("joinExam", async ({ name, examCode }) => {
      socket.join(examCode);
      io.to(examCode).emit("participantJoined", { name });
      // Emit current leaderboard
      const rankings = await computeLeaderboard(examCode);
      io.to(examCode).emit("leaderboardUpdate", { rankings });
    });

    socket.on("startExam", async ({ examCode }) => {
      // mark exam started
      await Exam.findOneAndUpdate({ code: examCode }, { started: true, status: "running" });
      io.to(examCode).emit("examStarted", { message: "Exam started" });
      // reset answerOrder for exam
      answerOrder[examCode] = {};
    });

    socket.on("nextQuestion", async (payload) => {
      // payload: { examCode, question, duration, questionIndex, totalQuestions }
      const { examCode, question } = payload;
      if (!examCode || !question) return;
      // initialize order array for this question
      if (!answerOrder[examCode]) answerOrder[examCode] = {};
      answerOrder[examCode][question._id || question.id || question.questionId] = [];
      io.to(examCode).emit("newQuestion", payload);
    });

    socket.on("submitAnswer", async (data) => {
      // data: { examCode, participantId, name, questionId, answerIndex, timeTaken }
      try {
        const { examCode, participantId, questionId, answerIndex, timeTaken, name } = data;
        if (!examCode || !participantId || !questionId) {
          socket.emit("submitError", { message: "Missing fields" });
          return;
        }

        const participant = await Participant.findById(participantId);
        const question = await Question.findById(questionId);
        if (!participant || !question) {
          socket.emit("submitError", { message: "Participant or question not found" });
          return;
        }

        // compute whether correct
        const correct = question.correctOptionIndex === answerIndex;

        // maintain submission order for bonus
        const qKey = questionId.toString();
        if (!answerOrder[examCode]) answerOrder[examCode] = {};
        if (!answerOrder[examCode][qKey]) answerOrder[examCode][qKey] = [];
        const orderArr = answerOrder[examCode][qKey];

        // assign speed bonus based on order
        const position = orderArr.length + 1; // 1-based
        orderArr.push(participantId);

        let bonus = 0;
        if (correct) {
          // base points
          const base = 500;
          // time bonus: faster => more bonus (simple formula)
          const timeBonus = Math.max(0, Math.round(Math.max(0, 120 - (timeTaken || 0)) / 2)); // 0..60
          // position bonus: first gets extra
          const positionBonus = position === 1 ? 100 : position === 2 ? 80 : position === 3 ? 60 : 0;
          bonus = base + timeBonus + positionBonus;
        } else {
          bonus = 0;
        }

        // update participant
        participant.answers.push({ questionId, answerIndex, correct, timeTaken });
        if (correct) participant.correctCount += 1;
        participant.points += bonus;
        participant.totalResponseTime += (timeTaken || 0);
        await participant.save();

        // compute leaderboard and emit to room
        const rankings = await computeLeaderboard(examCode);
        io.to(examCode).emit("leaderboardUpdate", { rankings });

        // confirm to submitter
        socket.emit("answerRecorded", { participantId, pointsEarned: bonus, correct });
      } catch (err) {
        socket.emit("submitError", { message: "Error processing answer" });
      }
    });

    socket.on("endExam", async ({ examCode }) => {
      await Exam.findOneAndUpdate({ code: examCode }, { started: false, status: "completed" });
      const finalRankings = await computeLeaderboard(examCode);
      io.to(examCode).emit("examEnded", { finalRankings });
    });

    socket.on("disconnect", () => {
      // Client disconnected
    });
  });

  // helper: compute leaderboard for an exam
  async function computeLeaderboard(examCode) {
    const participants = await Participant.find({ examCode }).lean();
    // compute accuracy and average time
    const enriched = participants.map((p) => {
      const accuracy = p.answers.length ? Math.round((p.correctCount / p.answers.length) * 100) : 0;
      const avgTime = p.answers.length ? Math.round(p.totalResponseTime / p.answers.length) : 0;
      return {
        participantId: p._id,
        name: p.name,
        points: p.points,
        correctCount: p.correctCount,
        answered: p.answers.length,
        accuracy,
        avgTime
      };
    });

    // sort by points desc, tie-breaker: avgTime asc
    enriched.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.avgTime - b.avgTime;
    });

    // assign rank
    return enriched.map((p, idx) => ({ rank: idx + 1, ...p }));
  }
}
