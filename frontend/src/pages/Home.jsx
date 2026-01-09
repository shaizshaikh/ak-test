// src/Pages/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (name && code) {
      navigate(`/exam/${code}`, { state: { name } });
    }
  };

  return (
    <div className="container mt-5">
      <h2>Join Quiz</h2>
      <div className="mb-3">
        <label>Name:</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label>Quiz Code:</label>
        <input
          type="text"
          className="form-control"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleJoin}>
        Join Exam
      </button>
    </div>
  );
}

export default Home;
