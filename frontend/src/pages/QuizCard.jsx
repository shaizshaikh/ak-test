// src/components/QuizCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function QuizCard({ quiz }) {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/examiner/live/${quiz.code}`);
  };

  const handleViewResult = () => {
    navigate(`/examiner/result/${quiz.code}`);
  };

  return (
    <div className="card mb-3">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title">{quiz.title}</h5>
          <p className="card-text">
            Code: {quiz.code} | Status: {quiz.status}
          </p>
        </div>
        <div>
          {quiz.status !== "running" && (
            <button className="btn btn-primary me-2" onClick={handleStart}>
              Start Exam
            </button>
          )}
          {quiz.status === "completed" && (
            <button className="btn btn-success" onClick={handleViewResult}>
              View Result
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizCard;
