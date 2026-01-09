import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import Layout from "./components/Layout.jsx";
import "./styles/custom.css";

// Pages
import Home from "./pages/Home.jsx"; // participant join page
import ExaminerDashboard from "./pages/ExaminerDashboard.jsx";
import CreateQuiz from "./pages/CreateQuiz.jsx";
import ManageQuizzes from "./pages/ManageQuizzes.jsx";
import LiveExamPanel from "./pages/LiveExamPanel.jsx";
import ExamPage from "./pages/ParticipantExam.jsx"; // participant exam page
import Results from "./pages/Results.jsx"; // results page

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Default route → redirect to Examiner Dashboard */}
            <Route index element={<Navigate to="/examiner" />} />

            {/* Participant join page */}
            <Route path="join" element={<Home />} />

            {/* Participant exam page */}
            <Route path="exam/:code" element={<ExamPage />} />

            {/* Examiner dashboard */}
            <Route path="examiner" element={<ExaminerDashboard />} />

            {/* Create quiz page */}
            <Route path="examiner/create" element={<CreateQuiz />} />

            {/* Manage quizzes page */}
            <Route path="examiner/manage" element={<ManageQuizzes />} />

            {/* Live exam panel (fixed path) */}
            <Route path="examiner/live/:code" element={<LiveExamPanel />} />

            {/* Results page */}
            <Route path="results/:code" element={<Results />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/examiner" />} />
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
