import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import examinerRoutes from "./routes/examinerRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import Result from "./models/Result.js";
import Exam from "./models/Exam.js";

dotenv.config({ path: path.join(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development'
      ? true  // Allow all origins in development
      : [
        process.env.FRONTEND_URL,
        "https://quiz-frontend.delightfuldune-f24f84f9.eastus.azurecontainerapps.io"
      ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? true  // Allow all origins in development
    : [
      process.env.FRONTEND_URL,
      "https://quiz-frontend.delightfuldune-f24f84f9.eastus.azurecontainerapps.io"
    ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);

    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      maxIdleTimeMS: 120000,
      retryWrites: false,
      ssl: true,
      authSource: "admin"
    };

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ MongoDB connected successfully');

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', err);
    }
    // Don't exit the process, let the app run without DB for now
  }
};

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

connectDB();

// Middleware to check database connection
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: "Database connection unavailable", 
      error: "Please check your MongoDB/Cosmos DB connection" 
    });
  }
  next();
};

const liveExams = {};

io.on("connection", (socket) => {

  socket.on("join_quiz", ({ quizCode, name }) => {
    socket.join(quizCode);

    if (!liveExams[quizCode]) {
      liveExams[quizCode] = {
        participants: [],
        leaderboard: [],
        currentQuestion: null,
        answerOrder: [],
        questionStartTime: null,
      };
    }

    if (name !== "Examiner") {
      const existing = liveExams[quizCode].participants.find((p) => p.name === name);
      if (!existing) {
        const participant = { name, points: 0, socketId: socket.id };
        liveExams[quizCode].participants.push(participant);
        liveExams[quizCode].leaderboard.push({
          name,
          points: 0,
          totalAnswers: 0,
          correctAnswers: 0,
          totalTime: 0,
          accuracy: 0,
          avgTime: 0
        });
      } else {
        existing.socketId = socket.id;
      }

      io.to(quizCode).emit("participant_joined", {
        name,
        participants: liveExams[quizCode].participants,
        leaderboard: liveExams[quizCode].leaderboard,
        totalParticipants: liveExams[quizCode].participants.length
      });
    } else {
      socket.emit("participant_joined", {
        name: "Examiner",
        participants: liveExams[quizCode].participants,
        leaderboard: liveExams[quizCode].leaderboard,
        totalParticipants: liveExams[quizCode].participants.length
      });
    }

    // Send current question if exam is in progress
    if (liveExams[quizCode].currentQuestion && name !== "Examiner") {
      socket.emit("new_question", liveExams[quizCode].currentQuestion);
    }

    if (name !== "Examiner") {
      Exam.findOne({ code: quizCode }).then(exam => {
        if (exam && exam.status === "live") {
          socket.emit("exam_started");
        }
      }).catch(() => {
        // Silently handle error
      });
    }
  });

  socket.on("request_exam_status", ({ quizCode }) => {
    Exam.findOne({ code: quizCode }).then(exam => {
      if (exam) {
        if (exam.status === "live") {
          socket.emit("exam_started");
        }
        if (liveExams[quizCode] && liveExams[quizCode].currentQuestion) {
          socket.emit("new_question", liveExams[quizCode].currentQuestion);
        }
      }
    }).catch(() => {
      // Silently handle error
    });
  });

  socket.on("submit_answer", ({ quizCode, name, answerIndex, timeTaken }) => {
    if (!liveExams[quizCode]) return;
    const examData = liveExams[quizCode];
    const q = examData.currentQuestion;
    if (!q) return;

    if (examData.answerOrder.find((a) => a.name === name)) return;

    const isCorrect = answerIndex === q.correctOptionIndex;
    let points = 0;
    let bonus = 0;

    if (isCorrect) {
      points = 500;

      const correctAnswersCount = examData.answerOrder.filter(a => a.isCorrect).length;

      switch (correctAnswersCount) {
        case 0: bonus = 500; break;
        case 1: bonus = 400; break;
        case 2: bonus = 300; break;
        case 3: bonus = 200; break;
        case 4: bonus = 100; break;
        case 5: bonus = 90; break;
        case 6: bonus = 80; break;
        case 7: bonus = 70; break;
        case 8: bonus = 60; break;
        case 9: bonus = 50; break;
        default: bonus = 25; break;
      }

      points += bonus;
    }

    examData.answerOrder.push({
      name,
      answerIndex,
      isCorrect,
      points,
      timeTaken,
      timestamp: Date.now(),
      correctRank: isCorrect ? (examData.answerOrder.filter(a => a.isCorrect).length + 1) : null
    });

    let participant = examData.leaderboard.find((p) => p.name === name);
    if (participant) {
      participant.points += points;
      participant.totalAnswers = (participant.totalAnswers || 0) + 1;
      participant.correctAnswers = (participant.correctAnswers || 0) + (isCorrect ? 1 : 0);
      participant.totalTime = (participant.totalTime || 0) + timeTaken;
      participant.accuracy = Math.round((participant.correctAnswers / participant.totalAnswers) * 100);
      participant.avgTime = Math.round(participant.totalTime / participant.totalAnswers);
    }

    examData.leaderboard.sort((a, b) => b.points - a.points);

    io.to(quizCode).emit("leaderboard_update", {
      leaderboard: examData.leaderboard,
      lastAnswer: {
        name,
        isCorrect,
        points,
        timeTaken,
        answerIndex,
        correctAnswer: q.options[q.correctOptionIndex],
        correctIndex: q.correctOptionIndex
      },
    });
  });

  socket.on("start_exam", (quizCode) => {
    io.to(quizCode).emit("exam_started");
    if (liveExams[quizCode] && liveExams[quizCode].participants) {
      liveExams[quizCode].participants.forEach(participant => {
        io.to(participant.socketId).emit("exam_started");
      });
    }
  });

  socket.on("send_question", ({ quizCode, question, questionIndex }) => {
    if (!liveExams[quizCode]) {
      liveExams[quizCode] = {
        participants: [],
        leaderboard: [],
        currentQuestion: null,
        answerOrder: [],
        questionStartTime: null,
      };
    }

    const correctOptionIndex = question.options.findIndex(opt => opt === question.correctOption);

    liveExams[quizCode].currentQuestion = {
      ...question,
      questionIndex,
      correctOptionIndex
    };
    liveExams[quizCode].answerOrder = [];
    liveExams[quizCode].questionStartTime = Date.now();

    const questionData = {
      questionText: question.questionText,
      options: question.options,
      time: question.time,
      questionIndex,
      startTime: liveExams[quizCode].questionStartTime,
      timeLimit: question.timeLimit || (question.time * 60)
    };

    if (liveExams[quizCode].participants) {
      liveExams[quizCode].participants.forEach(participant => {
        io.to(participant.socketId).emit("new_question", questionData);
      });
    }
  });

  socket.on("end_exam", async (quizCode) => {
    io.to(quizCode).emit("exam_ended");

    const examData = liveExams[quizCode];
    if (!examData || !examData.leaderboard.length) {
      return;
    }

    try {
      await Result.deleteMany({ quiz: quizCode });

      for (let i = 0; i < examData.leaderboard.length; i++) {
        const p = examData.leaderboard[i];
        const result = new Result({
          quiz: quizCode,
          participantName: p.name,
          points: p.points,
          rank: i + 1,
          accuracy: p.accuracy || 0,
          avgTime: p.avgTime || 0,
          totalAnswers: p.totalAnswers || 0,
          correctAnswers: p.correctAnswers || 0,
        });
        await result.save();
      }
    } catch (err) {
      // Silently handle error in production
    }
  });

  socket.on("disconnect", () => {
    Object.keys(liveExams).forEach(quizCode => {
      const examData = liveExams[quizCode];
      const participantIndex = examData.participants.findIndex(p => p.socketId === socket.id);

      if (participantIndex !== -1) {
        const participant = examData.participants[participantIndex];
        examData.participants.splice(participantIndex, 1);
        const leaderboardIndex = examData.leaderboard.findIndex(p => p.name === participant.name);
        if (leaderboardIndex !== -1) {
          examData.leaderboard.splice(leaderboardIndex, 1);
        }

        io.to(quizCode).emit("participant_joined", {
          name: participant.name,
          participants: examData.participants,
          leaderboard: examData.leaderboard,
          totalParticipants: examData.participants.length,
          action: "left"
        });
      }
    });
  });
});

app.use("/api/examiner", checkDBConnection, examinerRoutes);
app.use("/api/participant", checkDBConnection, participantRoutes);
app.use("/api/results", checkDBConnection, resultRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  };
  res.status(200).json(healthCheck);
});

// Serve frontend for all non-API routes (must be last)
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Only handle GET requests for frontend
  if (req.method !== 'GET') {
    return res.status(404).json({ error: 'Method not allowed' });
  }

  try {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  } catch (error) {
    res.status(404).send('Frontend not built yet. Run npm run build in frontend directory.');
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
export default app;
