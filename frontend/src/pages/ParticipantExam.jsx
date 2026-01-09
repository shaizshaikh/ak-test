// src/pages/ParticipantExam.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { getSocketURL } from "../config/api.js";
import { useNotifications } from "../contexts/NotificationContext";

const socket = io(getSocketURL());

function ParticipantExam() {
  const { code } = useParams();
  const location = useLocation();
  const { showNotification } = useNotifications();
  const [name, setName] = useState(location.state?.name || "");
  const [hasJoined, setHasJoined] = useState(!!location.state?.name);

  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(0);

  useEffect(() => {
    if (hasJoined && name.trim()) {
      socket.emit("join_quiz", { quizCode: code, name });
    }

    socket.on("exam_started", () => {
      setExamStarted(true);
      showNotification("🚀 The exam has started! Get ready!", "success");
    });

    socket.on("new_question", (q) => {
      setExamStarted(true);
      setCurrentQuestion(q);
      setHasAnswered(false);
      setQuestionStartTime(Date.now());
      
      // Set timer - convert minutes to seconds, default to 2 minutes if not specified
      const timeLimitInSeconds = (q.time || 2) * 60;
      setQuestionTimeLimit(timeLimitInSeconds);
      setTimeRemaining(timeLimitInSeconds);
    });

    socket.on("leaderboard_update", (data) => {
      setLeaderboard(data.leaderboard);

      // ✅ Fixed section: properly update my score
      const myEntry = data.leaderboard.find((p) => p.name === name);
      if (myEntry) {
        setMyScore(myEntry.points);
      }
    });

    socket.on("exam_ended", () => {
      setExamStarted(false);
      showNotification("🛑 The exam has ended. Thank you for participating!", "info");
    });

    return () => {
      socket.off("exam_started");
      socket.off("new_question");
      socket.off("leaderboard_update");
      socket.off("exam_ended");
    };
  }, [code, name, hasJoined]);

  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (currentQuestion && timeRemaining > 0 && !hasAnswered) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - auto submit or disable answers
            setHasAnswered(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentQuestion, timeRemaining, hasAnswered]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Submit answer
  const submitAnswer = (index) => {
    if (hasAnswered || timeRemaining <= 0) {
      if (timeRemaining <= 0) {
        showNotification("⏰ Time's up! You can no longer answer this question.", "warning");
      } else {
        showNotification("⚠️ You have already answered this question!", "warning");
      }
      return;
    }
    
    const timeTaken = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0;
    
    socket.emit("submit_answer", {
      quizCode: code,
      name,
      answerIndex: index,
      timeTaken: timeTaken
    });
    
    setHasAnswered(true);
  };

  // Join quiz handler
  const handleJoin = () => {
    if (!name.trim()) {
      showNotification("Please enter your name before joining.", "warning");
      return;
    }
    
    setHasJoined(true);
    socket.emit("join_quiz", { quizCode: code, name });
    
    // Request current exam status after joining
    socket.emit("request_exam_status", { quizCode: code });
  };

  return (
    <div className="container mt-5">
      <h2>Quiz Code: {code}</h2>

      {!hasJoined ? (
        <div className="mt-4">
          <label htmlFor="nameInput" className="form-label">
            Enter your name:
          </label>
          <input
            id="nameInput"
            type="text"
            className="form-control mb-3"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleJoin}>
            Join Quiz
          </button>
        </div>
      ) : (
        <>
          <div className="row mt-3">
            <div className="col-md-8">
              <h4>Participant: {name}</h4>
            </div>
            <div className="col-md-4 text-end">
              <div className="badge bg-primary fs-6 me-2">Score: {myScore} points</div>
              {leaderboard.length > 0 && (
                <div className="badge bg-success fs-6">
                  Rank: #{leaderboard
                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                    .findIndex(p => p.name === name) + 1} / {leaderboard.length}
                </div>
              )}
            </div>
          </div>

          {!examStarted && !currentQuestion && (
            <p className="mt-4 text-muted">
              Waiting for examiner to start the exam...
            </p>
          )}

          {examStarted && currentQuestion && (
            <div className="mt-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Question {currentQuestion.questionIndex + 1 || 1}</h5>
                  <div className={`badge fs-6 ${timeRemaining <= 30 ? 'bg-danger' : timeRemaining <= 60 ? 'bg-warning' : 'bg-success'}`}>
                    ⏱️ {formatTime(timeRemaining)}
                  </div>
                </div>
                <div className="card-body">
                  <p className="fw-bold mb-3">{currentQuestion.questionText}</p>
                  <div className="d-grid gap-2">
                    {currentQuestion.options.map((opt, i) => (
                      <button
                        key={i}
                        className={`btn ${hasAnswered || timeRemaining <= 0 ? 'btn-secondary' : 'btn-outline-primary'} text-start`}
                        onClick={() => submitAnswer(i)}
                        disabled={hasAnswered || timeRemaining <= 0}
                      >
                        <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
                      </button>
                    ))}
                  </div>
                  {hasAnswered && (
                    <div className="alert alert-success mt-3">
                      ✅ Answer submitted! Waiting for next question...
                    </div>
                  )}
                  {timeRemaining <= 0 && !hasAnswered && (
                    <div className="alert alert-danger mt-3">
                      ⏰ Time's up! Moving to next question...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {examStarted && !currentQuestion && (
            <div className="alert alert-info mt-4">
              📝 Waiting for examiner to send the next question...
            </div>
          )}

          <div className="card mt-5">
            <div className="card-header">
              <h5 className="mb-0">🏆 Live Leaderboard</h5>
            </div>
            <div className="card-body">
              {leaderboard.length === 0 ? (
                <p className="text-muted text-center">No results yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Participant</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard
                        .sort((a, b) => (b.points || 0) - (a.points || 0))
                        .map((participant, index) => (
                        <tr 
                          key={`${participant.name}-${index}`} 
                          className={`${participant.name === name ? 'table-info' : ''} ${index < 3 ? 'table-warning' : ''}`}
                        >
                          <td>
                            <strong>#{index + 1}</strong>
                            {index === 0 && <span className="ms-1">🥇</span>}
                            {index === 1 && <span className="ms-1">🥈</span>}
                            {index === 2 && <span className="ms-1">🥉</span>}
                          </td>
                          <td>
                            <strong>{participant.name}</strong>
                            {participant.name === name && <span className="ms-2 badge bg-info">You</span>}
                          </td>
                          <td><span className="badge bg-primary">{participant.points || 0}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ParticipantExam;
