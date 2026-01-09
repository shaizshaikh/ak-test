// src/pages/Results.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft, Users, Target, Clock } from "lucide-react";
import axios from "axios";
import { getResultsAPI } from "../config/api.js";

function Results() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendURL = getResultsAPI();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(`${backendURL}/${code}`);
        
        if (Array.isArray(res.data)) {
          setResults(res.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Exam not found");
        } else if (err.response?.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(`Failed to load results: ${err.response?.data?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchResults();
    } else {
      setError("No exam code provided");
      setLoading(false);
    }
  }, [code, backendURL]);

  const handleBack = () => navigate("/examiner/manage");

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status" />
        <p className="mt-3">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Manage Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          <ArrowLeft size={16} /> Back to Manage
        </button>
        <h2 className="text-center">Exam Results</h2>
        <div className="badge bg-primary fs-6">Code: {code}</div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <Users size={32} className="text-primary mb-2" />
              <h5>{results.length}</h5>
              <p className="text-muted mb-0">Total Participants</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <Target size={32} className="text-success mb-2" />
              <h5>{results.length > 0 ? Math.round(results.reduce((a, r) => a + (r.accuracy || 0), 0) / results.length) : 0}%</h5>
              <p className="text-muted mb-0">Average Accuracy</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <Clock size={32} className="text-warning mb-2" />
              <h5>{results.length > 0 ? Math.round(results.reduce((a, r) => a + (r.avgTime || 0), 0) / results.length) : 0}s</h5>
              <p className="text-muted mb-0">Average Time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0"><Trophy size={20} /> Final Leaderboard</h5>
        </div>
        <div className="card-body">
          {results.length === 0 ? (
            <div className="text-center py-5">
              <Trophy size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No Results Yet</h5>
              <p className="text-muted">
                No participants have completed this exam yet.<br/>
                Results will appear here after participants finish the exam.
              </p>
              <div className="mt-3">
                <button className="btn btn-outline-secondary" onClick={handleBack}>
                  Back to Manage
                </button>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Rank</th>
                    <th>Participant</th>
                    <th>Points</th>
                    <th>Accuracy</th>
                    <th>Avg Time</th>
                    <th>Correct/Total</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((p, i) => (
                    <tr key={i} className={i < 3 ? "table-warning" : ""}>
                      <td>
                        <strong>#{p.rank}</strong>
                        {i === 0 && <Trophy size={16} className="text-warning ms-1" />}
                      </td>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="badge bg-primary fs-6">{p.points}</span></td>
                      <td>{p.accuracy}%</td>
                      <td>{p.avgTime}s</td>
                      <td>{p.correctAnswers}/{p.totalAnswers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-secondary btn-lg" onClick={handleBack}>
          <ArrowLeft size={16} /> Back to Manage Quizzes
        </button>
      </div>
    </div>
  );
}

export default Results;
