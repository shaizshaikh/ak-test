import Exam from "../models/Exam.js";
import Result from "../models/Result.js";

export const createExam = async (req, res) => {
  try {
    console.log('📝 Creating exam with data:', req.body);
    const { title, code, questions } = req.body;

    let examCode = code;
    if (!examCode) {
      examCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      console.log('❌ No questions provided');
      return res.status(400).json({ message: "Add at least one question!" });
    }

    const invalidQuestion = questions.find(
      (q) =>
        !q.questionText ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        !q.correctOption
    );

    if (invalidQuestion) {
      console.log('❌ Invalid question found:', invalidQuestion);
      return res.status(400).json({
        message: "Each question must have text, options, and a correct option.",
      });
    }

    try {
      const existing = await Exam.findOne({ code: examCode });
      if (existing) {
        console.log('❌ Exam code already exists:', examCode);
        return res.status(400).json({ message: "Exam code already exists" });
      }
    } catch (findError) {
      console.log('⚠️ Error checking existing exam:', findError.message);
    }

    const examData = {
      code: examCode,
      title: title || "Quiz",
      status: "ready",
      started: false,
      currentQuestionIndex: 0,
      questions: questions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption,
        time: q.time || 2
      }))
    };

    console.log('💾 Saving exam data:', examData);
    const exam = new Exam(examData);
    const savedExam = await exam.save();
    console.log('✅ Exam saved successfully:', savedExam._id);

    res.status(201).json({ 
      message: "Exam created successfully", 
      exam: {
        _id: savedExam._id,
        code: savedExam.code,
        title: savedExam.title,
        status: savedExam.status,
        questions: savedExam.questions
      }
    });
  } catch (err) {
    console.error('💥 Error creating exam:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Exam code already exists" });
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

export const getExams = async (req, res) => {
  try {
    console.log('📋 Fetching all exams...');
    // Remove the sort to avoid indexing issues with Cosmos DB
    const exams = await Exam.find();
    console.log(`✅ Found ${exams.length} exams:`, exams.map(e => ({ code: e.code, title: e.title, status: e.status })));
    
    // Sort in JavaScript instead of MongoDB to avoid indexing issues
    const sortedExams = exams.sort((a, b) => {
      // Sort by _id (which contains timestamp) in descending order
      return b._id.getTimestamp() - a._id.getTimestamp();
    });
    
    res.json(sortedExams);
  } catch (err) {
    console.error('💥 Error fetching exams:', err);
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

export const getExamByCode = async (req, res) => {
  try {
    const exam = await Exam.findOne({ code: req.params.code });
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const { code } = req.params;
    const { questionText, options, correctOption, time } = req.body;

    const exam = await Exam.findOne({ code });
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    exam.questions.push({ questionText, options, correctOption, time });
    await exam.save();

    res.json({ message: "Question added successfully", exam });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const startExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { code: req.params.code },
      { status: "live", started: true },
      { new: true }
    );

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const liveLink = `${process.env.FRONTEND_URL}/examiner/live/${exam.code}`;

    res.json({
      message: "Exam started successfully",
      exam,
      link: liveLink,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const endExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { code: req.params.code },
      { status: "ended", started: false },
      { new: true }
    );

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    res.json({ message: "Exam ended successfully", exam });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const examCode = req.params.code;

    const exam = await Exam.findOne({ code: examCode });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const deleteResult = await Exam.deleteOne({ code: examCode });
    
    if (deleteResult.deletedCount > 0) {
      try {
        await Result.deleteMany({ quiz: examCode });
      } catch (resultErr) {
        // Silently handle error
      }
      
      res.json({ 
        message: "Exam deleted successfully", 
        deletedCount: deleteResult.deletedCount,
        examCode: examCode
      });
    } else {
      res.status(500).json({ message: "Failed to delete exam" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getResults = async (req, res) => {
  try {
    const { code } = req.params;
    
    const exam = await Exam.findOne({ code });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const results = await Result.find({ quiz: code });
    const sortedResults = results.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    const transformedResults = sortedResults.map((result, index) => ({
      name: result.participantName,
      points: result.points || 0,
      accuracy: result.accuracy || 0,
      avgTime: result.avgTime || 0,
      rank: index + 1,
      totalAnswers: result.totalAnswers || 0,
      correctAnswers: result.correctAnswers || 0
    }));
    
    res.json({ 
      exam: { code: exam.code, status: exam.status, title: exam.title || "Quiz" },
      results: transformedResults
    });
    
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
