import React, { useEffect, useState } from "react";
import axios from "axios";
import { Play, StopCircle, Trophy, Trash2, MoreVertical, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { getExaminerAPI, getFrontendURL, getSocketURL } from "../config/api.js";
import { useNotifications } from "../contexts/NotificationContext";
import { getCleanErrorMessage } from "../utils/errorUtils.js";
import Modal from "../components/ui/Modal.jsx";

const socket = io(getSocketURL());

export default function ManageQuizzes() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [showEndConfirm, setShowEndConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const backendURL = getExaminerAPI();
  const frontendURL = getFrontendURL();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendURL}`);
      setExams(res.data.exams || res.data);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchExams();
      }
    };
    
    const handleFocus = () => {
      fetchExams();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const startExam = async (exam) => {
    try {
      const response = await axios.put(`${backendURL}/${exam.code}/start`);
      socket.emit("start_exam", exam.code);
      
      showNotification("✅ Exam started successfully! Participants have been notified.", "success");
      navigate(`/examiner/live/${exam.code}`);
      
    } catch (err) {
      console.error("Error starting exam:", err);
      
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error') || err.message.includes('timeout')) {
        showNotification("Database connection issue, but proceeding to live panel...", "warning");
        navigate(`/examiner/live/${exam.code}`);
      } else {
        const cleanErrorMsg = getCleanErrorMessage(err);
        showNotification("Failed to start exam: " + cleanErrorMsg, "error");
      }
    }
  };

  const endExam = (exam) => {
    setShowEndConfirm(exam);
  };

  const confirmEndExam = async () => {
    const exam = showEndConfirm;
    setShowEndConfirm(null);
    
    try {
      await axios.put(`${backendURL}/${exam.code}/end`);
      
      socket.emit("end_exam", exam.code);
      
      showNotification("✅ Exam ended successfully! Results have been saved.", "success");
      
      // Refresh the exams list
      fetchExams();
    } catch (err) {
      console.error("Error ending exam:", err);
      const cleanErrorMsg = getCleanErrorMessage(err);
      showNotification(`❌ Failed to end exam: ${cleanErrorMsg}`, "error");
    }
  };

  const deleteExam = (examCode) => {
    setShowDeleteConfirm(examCode);
  };

  const confirmDeleteExam = async () => {
    const examCode = showDeleteConfirm;
    setShowDeleteConfirm(null);
    
    try {
      setExams(prevExams => prevExams.filter(exam => exam.code !== examCode));
      
      const response = await axios.delete(`${backendURL}/${examCode}`);
      
      showNotification("Exam deleted successfully!", "success");
      
      await fetchExams();
      
    } catch (err) {
      console.error("Error deleting exam:", err);
      
      await fetchExams();
      
      const cleanErrorMsg = getCleanErrorMessage(err);
      showNotification(`Failed to delete exam: ${cleanErrorMsg}`, "error");
    }
  };

  const copyExamLink = (examCode) => {
    const link = `${frontendURL}/exam/${examCode}`;
    navigator.clipboard.writeText(link);
    showNotification("📋 Link copied successfully!", "success");
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Manage Quizzes</h2>
      


      {loading ? (
        <p className="text-center">Loading exams...</p>
      ) : exams.length === 0 ? (
        <p className="text-center">No exams available.</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead className="table-dark text-center">
            <tr>
              <th>Exam Code</th>
              <th>Exam Link</th>
              <th>Status</th>
              <th>Result</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody className="text-center align-middle">
            {exams.map((exam) => (
              <tr key={exam._id}>
                <td>{exam.code}</td>

                {/* Exam Link */}
                <td>
                  <div className="d-flex align-items-center justify-content-between">
                    <a
                      href={`${frontendURL}/exam/${exam.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      {`${frontendURL}/exam/${exam.code}`}
                    </a>
                    <button
                      className="btn btn-light btn-sm ms-2"
                      onClick={() => copyExamLink(exam.code)}
                      title="Copy link"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </td>

                {/* Status Column */}
                <td>
                  <div className="d-flex flex-column">
                    <small className="text-muted">Status: {exam.status}</small>
                    {exam.status === "ready" && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => startExam(exam)}
                      >
                        <Play size={16} /> Start
                      </button>
                    )}

                    {exam.status === "live" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => endExam(exam)}
                      >
                        <StopCircle size={16} /> End
                      </button>
                    )}

                    {exam.status === "ended" && (
                      <span style={{ color: "gray", fontWeight: "bold" }}>Completed</span>
                    )}
                  </div>
                </td>

                {/* Result Column */}
                <td>
                  {exam.status === "ended" ? (
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => navigate(`/results/${exam.code}`)}
                    >
                      <Trophy size={16} /> View Result
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" disabled>
                      <Trophy size={16} /> View Result
                    </button>
                  )}

                </td>

                {/* Actions */}
                <td style={{ position: "relative" }}>
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() =>
                      setMenuOpen(menuOpen === exam.code ? null : exam.code)
                    }
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuOpen === exam.code && (
                    <div
                      className="card p-2 shadow"
                      style={{
                        position: "absolute",
                        right: "0",
                        top: "100%",
                        zIndex: 10,
                        width: "120px",
                      }}
                    >
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => {
                          deleteExam(exam.code);
                          setMenuOpen(null);
                        }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* End Exam Confirmation Modal */}
      <Modal.Confirm
        show={!!showEndConfirm}
        onHide={() => setShowEndConfirm(null)}
        onConfirm={confirmEndExam}
        title="Confirm End Exam"
        message={`Are you sure you want to end the exam "${showEndConfirm?.code}"? This action cannot be undone. All participants will be notified and results will be saved.`}
        confirmText="End Exam"
        cancelText="Cancel"
        confirmVariant="danger"
      />

      {/* Delete Exam Confirmation Modal */}
      <Modal.Confirm
        show={!!showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(null)}
        onConfirm={confirmDeleteExam}
        title="Confirm Delete Exam"
        message={`Are you sure you want to delete the exam "${showDeleteConfirm}"? This action cannot be undone. All exam data will be permanently deleted.`}
        confirmText="Delete Exam"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}
