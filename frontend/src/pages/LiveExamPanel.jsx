import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { Play, Square, Users, Trophy, ArrowLeft } from "lucide-react";
import { getExaminerAPI, getSocketURL } from "../config/api.js";
import { useNotifications } from "../contexts/NotificationContext";
import { getCleanErrorMessage } from "../utils/errorUtils.js";
import Modal from "../components/ui/Modal.jsx";

const socket = io(getSocketURL());

export default function LiveExamPanel() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [examStarted, setExamStarted] = useState(false);
  const [questionSent, setQuestionSent] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const backendURL = getExaminerAPI();

  // Fetch exam details
  const fetchExam = async () => {
    try {
      const response = await axios.get(`${backendURL}/${code}`);
      setExam(response.data);
      setExamStarted(response.data.status === "live");
      setLoading(false);
    } catch (err) {
      console.error("Error fetching exam:", err);
      const cleanErrorMsg = getCleanErrorMessage(err);
      showNotification(`Failed to load exam details: ${cleanErrorMsg}`, "error");
      navigate("/examiner/manage");
    }
  };

  useEffect(() => {
    if (code) {
      fetchExam();
      
      // Join the exam room as examiner
      socket.emit("join_quiz", { quizCode: code, name: "Examiner" });
      
      socket.on("participant_joined", (data) => {
        if (data.participants) {
          setParticipants([...data.participants]); // Force new array reference
        }
        if (data.leaderboard) {
          setLeaderboard([...data.leaderboard]); // Force new array reference
        }
      });
      
      // Listen for leaderboard updates
      socket.on("leaderboard_update", (data) => {
        setLeaderboard([...data.leaderboard]);
        
        if (data.leaderboard && participants.length > 0) {
          const updatedParticipants = participants.map(p => {
            const leaderboardEntry = data.leaderboard.find(l => l.name === p.name);
            return leaderboardEntry ? { ...p, points: leaderboardEntry.points } : p;
          });
          setParticipants(updatedParticipants);
        }
      });
      
      return () => {
        socket.off("participant_joined");
        socket.off("leaderboard_update");
      };
    }
  }, [code]);

  // Start the exam
  const handleStartExam = async () => {
    try {
      await axios.put(`${backendURL}/${code}/start`);
      setExamStarted(true);
      setExam(prev => ({ ...prev, status: "live" }));
      
      // Emit socket event to notify all participants
      socket.emit("start_exam", code);
      
      showNotification("✅ Exam started successfully!", "success");
    } catch (err) {
      console.error("Error starting exam:", err);
      const cleanErrorMsg = getCleanErrorMessage(err);
      showNotification(`❌ Failed to start exam: ${cleanErrorMsg}`, "error");
    }
  };

  // End the exam
  const handleEndExam = () => {
    setShowEndConfirm(true);
  };

  const confirmEndExam = async () => {
    setShowEndConfirm(false);
    try {
      await axios.put(`${backendURL}/${code}/end`);
      setExamStarted(false);
      setExam(prev => ({ ...prev, status: "ended" }));
      
      // Emit socket event to notify all participants
      socket.emit("end_exam", code);
      
      showNotification("✅ Exam ended successfully!", "success");
      navigate("/examiner/manage");
    } catch (err) {
      console.error("Error ending exam:", err);
      const cleanErrorMsg = getCleanErrorMessage(err);
      showNotification(`❌ Failed to end exam: ${cleanErrorMsg}`, "error");
    }
  };

  const cancelEndExam = () => {
    setShowEndConfirm(false);
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Send current question to participants
  const handleSendQuestion = () => {
    if (currentQuestion && examStarted) {
      socket.emit("send_question", { 
        quizCode: code, 
        question: currentQuestion,
        questionIndex: currentQuestionIndex
      });
      setQuestionSent(true);
      showNotification(`📤 Question ${currentQuestionIndex + 1} sent to all participants!`, "success");
      
      // Reset question sent status after moving to next question
      setTimeout(() => setQuestionSent(false), 1000);
    } else {
      showNotification("⚠️ Please make sure the exam is started and a question is selected.", "warning");
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading exam details...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mt-5 text-center">
        <h3>Exam not found</h3>
        <button className="btn btn-primary" onClick={() => navigate("/examiner/manage")}>
          Back to Manage Quizzes
        </button>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate("/examiner/manage")}
        >
          <ArrowLeft size={16} /> Back to Manage
        </button>
        <h2 className="text-center">Live Exam Panel</h2>
        <div className="badge bg-primary fs-6">Code: {exam.code}</div>
      </div>

      {/* Exam Status */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Exam Status</h5>
              <span className={`badge ${exam.status === 'live' ? 'bg-success' : exam.status === 'ready' ? 'bg-warning' : 'bg-secondary'}`}>
                {exam.status.toUpperCase()}
              </span>
            </div>
            <div className="card-body">
              <p><strong>Total Questions:</strong> {exam.questions.length}</p>
              <p><strong>Current Question:</strong> {currentQuestionIndex + 1} of {exam.questions.length}</p>
              
              {!examStarted && exam.status === 'ready' && (
                <button className="btn btn-success btn-lg" onClick={handleStartExam}>
                  <Play size={20} /> Start Exam
                </button>
              )}
              
              {examStarted && (
                <button className="btn btn-danger btn-lg" onClick={handleEndExam}>
                  <Square size={20} /> End Exam
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0"><Users size={20} /> Participants ({participants.length})</h5>
            </div>
            <div className="card-body" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {participants.length === 0 ? (
                <p className="text-muted text-center">No participants yet</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {participants.map((participant, index) => (
                    <li key={`${participant.name}-${index}`} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>{participant.name}</span>
                      <span className="badge bg-primary rounded-pill">{participant.points || 0} pts</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Display */}
      {exam.questions.length > 0 && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Question {currentQuestionIndex + 1}</h5>
            <div>
              <button 
                className="btn btn-outline-primary btn-sm me-2"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === exam.questions.length - 1}
              >
                Next
              </button>
            </div>
          </div>
          <div className="card-body">
            <h6 className="mb-3">{currentQuestion.questionText}</h6>
            <div className="row">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="col-md-6 mb-2">
                  <div className={`p-2 border rounded ${option === currentQuestion.correctOption ? 'bg-success text-white' : 'bg-light'}`}>
                    <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                    {option === currentQuestion.correctOption && (
                      <span className="ms-2">✓ Correct</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 d-flex justify-content-between align-items-center">
              <small className="text-muted">Time: {currentQuestion.time} minutes</small>
              {examStarted && (
                <button 
                  className="btn btn-primary"
                  onClick={handleSendQuestion}
                >
                  Send Question to Participants
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0"><Trophy size={20} /> Live Leaderboard</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard
                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                    .map((participant, index) => (
                    <tr key={`${participant.name}-${index}`} className={index < 3 ? 'table-warning' : ''}>
                      <td>
                        <strong>#{index + 1}</strong>
                        {index === 0 && <span className="ms-1">🥇</span>}
                        {index === 1 && <span className="ms-1">🥈</span>}
                        {index === 2 && <span className="ms-1">🥉</span>}
                      </td>
                      <td><strong>{participant.name}</strong></td>
                      <td><span className="badge bg-primary">{participant.points || 0}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Exam Link */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Exam Link</h5>
        </div>
        <div className="card-body">
          <div className="input-group">
            <input 
              type="text" 
              className="form-control" 
              value={`${window.location.origin}/exam/${exam.code}`}
              readOnly
            />
            <button 
              className="btn btn-outline-secondary"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.code}`);
                showNotification("📋 Link copied successfully!", "success");
              }}
            >
              Copy Link
            </button>
          </div>
          <small className="text-muted">Share this link with participants to join the exam</small>
        </div>
      </div>

      {/* End Exam Confirmation Modal */}
      <Modal.Confirm
        show={showEndConfirm}
        onHide={cancelEndExam}
        onConfirm={confirmEndExam}
        title="Confirm End Exam"
        message="Are you sure you want to end this exam? This action cannot be undone. All participants will be notified and results will be saved."
        confirmText="End Exam"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}