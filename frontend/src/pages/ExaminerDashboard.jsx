import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ExaminerDashboard = () => {
  const navigate = useNavigate();

  const handleCreateQuiz = () => {
    navigate("/examiner/create");
  };

  const handleManageQuizzes = () => {
    navigate("/examiner/manage");
  };

  return (
    <div className="container mt-4">
      <h2>Examiner Dashboard</h2>
      <div className="mb-3">
        <Button variant="primary" onClick={handleCreateQuiz} className="me-2">
          + Create New Quiz
        </Button>
        <Button variant="secondary" onClick={handleManageQuizzes}>
          Manage Quizzes
        </Button>
      </div>
    </div>
  );
};

export default ExaminerDashboard;
