import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit2 } from "lucide-react";
import { getExaminerAPI, getFrontendURL } from "../config/api.js";
import { getCleanErrorMessage } from "../utils/errorUtils.js";
import Modal from "../components/ui/Modal.jsx";

function CreateQuiz() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOption: "",
    time: 2,
  });
  const [message, setMessage] = useState("");
  const [examLink, setExamLink] = useState("");
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [examSaved, setExamSaved] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const generateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCode(randomCode);
    setMessage(`✅ Exam code generated: ${randomCode}`);
  };

  // Add or update question
  const addOrUpdateQuestion = () => {
    if (!currentQ.questionText.trim())
      return setMessage("⚠️ Please enter question text.");
    if (currentQ.options.some((opt) => !opt.trim()))
      return setMessage("⚠️ All options are required.");
    if (currentQ.correctOption === "")
      return setMessage("⚠️ Please select the correct option.");

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = currentQ;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
      setMessage("✅ Question updated successfully!");
    } else {
      setQuestions([...questions, currentQ]);
      setMessage("✅ Question added successfully!");
    }

    setCurrentQ({
      questionText: "",
      options: ["", "", "", ""],
      correctOption: "",
      time: 2,
    });
  };

  const editQuestion = (index) => {
    setCurrentQ(questions[index]);
    setEditingIndex(index);
  };

  const deleteQuestion = (index) => {
    setShowDeleteConfirm(index);
  };

  const confirmDeleteQuestion = () => {
    const index = showDeleteConfirm;
    setShowDeleteConfirm(null);
    
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    setMessage("✅ Question deleted successfully!");
    if (editingIndex === index) setEditingIndex(null);
  };

  const generateLink = () => {
    if (questions.length === 0)
      return setMessage("⚠️ Add at least one question first.");
    const link = `${getFrontendURL()}/exam/${code}`;
    setExamLink(link);
    setLinkGenerated(true);
    setMessage("🔗 Exam link generated successfully!");
  };

  const saveExam = async () => {
    setMessage("🔄 Saving exam...");
    
    if (!code) {
      setMessage("⚠️ Generate exam code first!");
      return;
    }
    if (questions.length === 0) {
      setMessage("⚠️ Add at least one question!");
      return;
    }

    try {
      const response = await axios.post(`${getExaminerAPI()}/createExam`, {
        title: "Quiz",
        code,
        questions,
      });
      
      setExamSaved(true);
      setMessage("✅ Exam saved successfully!");
      setTimeout(() => navigate("/examiner/manage"), 1500);
    } catch (err) {
      const cleanErrorMsg = getCleanErrorMessage(err);
      setMessage(`❌ Failed to save exam: ${cleanErrorMsg}`);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">Create Quiz</h2>
        {message && <div className="alert alert-info text-center">{message}</div>}

        {!code && (
          <div className="text-center">
            <button className="btn btn-primary btn-lg" onClick={generateCode}>
              Generate Exam Code
            </button>
          </div>
        )}

        {code && (
          <>
            <div className="alert alert-success text-center mt-3">
              <strong>Exam Code:</strong> {code}
            </div>

            <div className="card p-3 mt-3 border-info">
              <h5>{editingIndex !== null ? "Edit Question" : "Add Question"}</h5>

              <div className="mb-3">
                <label className="form-label">Question Text</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter question..."
                  value={currentQ.questionText}
                  onChange={(e) =>
                    setCurrentQ({ ...currentQ, questionText: e.target.value })
                  }
                />
              </div>

              {currentQ.options.map((opt, i) => (
                <div className="mb-2" key={i}>
                  <label className="form-label">Option {i + 1}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...currentQ.options];
                      updated[i] = e.target.value;
                      setCurrentQ({ ...currentQ, options: updated });
                    }}
                  />
                </div>
              ))}

              <div className="mb-3">
                <label className="form-label">Correct Option</label>
                <select
                  className="form-select"
                  value={currentQ.correctOption}
                  onChange={(e) =>
                    setCurrentQ({ ...currentQ, correctOption: e.target.value })
                  }
                >
                  <option value="">Select correct option</option>
                  {currentQ.options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt || `Option ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Time for Question (minutes)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={currentQ.time}
                  onChange={(e) =>
                    setCurrentQ({ ...currentQ, time: parseInt(e.target.value) })
                  }
                />
              </div>

              <button
                className="btn btn-success"
                onClick={addOrUpdateQuestion}
              >
                {editingIndex !== null ? "Update Question" : "Add Question"}
              </button>
            </div>

            {questions.length > 0 && (
              <div className="text-center mt-4">
                {!linkGenerated && (
                  <button className="btn btn-warning btn-lg me-2" onClick={generateLink}>
                    Generate Exam Link
                  </button>
                )}
                
                <button 
                  className="btn btn-success btn-lg" 
                  onClick={saveExam}
                  disabled={examSaved}
                >
                  {examSaved ? "✅ Saved" : "Save Exam"}
                </button>
              </div>
            )}

            {linkGenerated && (
              <div className="alert alert-info text-center mt-3">
                <strong>Exam Link:</strong>{" "}
                <a href={examLink} target="_blank" rel="noopener noreferrer">
                  {examLink}
                </a>
              </div>
            )}

            {examSaved && (
              <div className="alert alert-success text-center mt-3">
                ✅ Exam saved! Redirecting to Manage Quiz...
              </div>
            )}
          </>
        )}
      </div>

      {/* Questions list */}
      {questions.length > 0 && (
        <div className="card mt-4 p-3">
          <h5>Saved Questions ({questions.length})</h5>
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Time (min)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{q.questionText}</td>
                  <td>{q.time}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => editQuestion(idx)}
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteQuestion(idx)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Question Confirmation Modal */}
      <Modal.Confirm
        show={showDeleteConfirm !== null}
        onHide={() => setShowDeleteConfirm(null)}
        onConfirm={confirmDeleteQuestion}
        title="Confirm Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete Question"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}

export default CreateQuiz;
