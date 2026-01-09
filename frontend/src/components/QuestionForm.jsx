// src/components/QuestionForm.jsx
import React from "react";

function QuestionForm({ question, onAnswer }) {
  return (
    <div>
      <p>{question.questionText}</p>
      {question.options.map((opt, i) => (
        <button key={i} className="btn btn-outline-primary me-2 mb-2" onClick={() => onAnswer(i)}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export default QuestionForm;
